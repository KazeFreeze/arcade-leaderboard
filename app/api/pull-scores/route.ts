// app/api/pull-scores/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import mqtt from "mqtt"; // The new MQTT client library
import { revalidatePath } from "next/cache";

// ROUTE SEGMENT CONFIG: Force dynamic rendering and disable all caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Define cache-control headers to be reused in responses.
const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * This function connects to the MQTT broker to "pull" the latest score.
 * It relies on the score being published with the 'retain' flag set to true.
 * It's wrapped in a Promise to handle the asynchronous nature of an MQTT connection.
 */
function fetchLatestScoreFromMQTT(): Promise<any> {
  return new Promise((resolve, reject) => {
    const brokerHost = process.env.MQTT_BROKER_URL;

    // Check if the broker URL is defined in your environment variables.
    if (!brokerHost) {
      return reject(
        new Error("MQTT_BROKER_URL is not defined in environment variables.")
      );
    }

    // FIX: Vercel Edge Functions require a WebSocket connection ('wss').
    // We construct the full URL with the correct protocol and port for HiveMQ Cloud.
    const fullBrokerUrl = `wss://${brokerHost}:8884/mqtt`;

    const options: mqtt.IClientOptions = {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 0, // Do not attempt to reconnect
      // The protocol is now part of the URL, so no need for extra options here.
    };

    // Connect using the full WebSocket URL.
    const client = mqtt.connect(fullBrokerUrl, options);

    // Set a timeout for the entire operation to prevent it from hanging.
    const operationTimeout = setTimeout(() => {
      client.end(true, () =>
        reject(new Error("MQTT operation timed out after 10 seconds."))
      );
    }, 10000);

    client.on("connect", () => {
      // Subscribe to the topic where scores are published.
      client.subscribe("scores/new", { qos: 1 }, (err) => {
        if (err) {
          client.end(true, () => reject(err));
        }
        // If no retained message exists, this will wait. We add a short
        // timeout to handle this case gracefully.
        setTimeout(() => {
          client.end(true, () => resolve(null)); // No message received
        }, 2000); // Wait 2 seconds for a message
      });
    });

    client.on("message", (topic, message) => {
      // As soon as we receive the first message (the retained one),
      // parse it, resolve the promise, and close the connection.
      try {
        const scoreData = JSON.parse(message.toString());
        resolve(scoreData);
      } catch (e) {
        reject(new Error("Failed to parse MQTT message JSON."));
      } finally {
        client.end(true);
      }
    });

    client.on("error", (err) => {
      // The 'Missing protocol' error originates here if the URL is bad.
      reject(err);
      client.end(true);
    });

    // Clear the master timeout when the promise settles
    Promise.resolve().finally(() => clearTimeout(operationTimeout));
  });
}

/**
 * This POST endpoint is triggered by the frontend to initiate the score pull.
 */
export async function POST() {
  try {
    const scoreData = await fetchLatestScoreFromMQTT();

    // If no new score was pulled (no retained message), exit successfully.
    if (!scoreData) {
      return NextResponse.json(
        {
          message: "No new score available from MQTT.",
        },
        { headers: CACHE_HEADERS }
      );
    }

    const { score, gamemode } = scoreData;

    if (typeof score !== "number" || !gamemode) {
      return NextResponse.json(
        { error: "Invalid score data from MQTT" },
        { status: 400, headers: CACHE_HEADERS }
      );
    }

    // Simple idempotency check: To avoid duplicates if the user refreshes quickly,
    // we check if this exact score for this gamemode was added in the last minute.
    const { rows: recentScores } = await sql`
            SELECT id FROM leaderboard
            WHERE score = ${score} AND gamemode = ${gamemode}
            AND datetime > NOW() - INTERVAL '1 minute';
        `;

    if (recentScores.length > 0) {
      return NextResponse.json(
        {
          message: "Score already processed recently.",
        },
        { headers: CACHE_HEADERS }
      );
    }

    // Insert the new score into the database and mark it as pending a name.
    await sql`
          INSERT INTO leaderboard (score, gamemode, datetime, pending_name)
          VALUES (${score}, ${gamemode}, NOW(), TRUE);
        `;

    // Revalidate the path to trigger the modal on the client.
    revalidatePath("/");

    return NextResponse.json(
      {
        message: "Score pulled and added successfully",
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Error in /api/pull-scores:", (error as Error).message);
    return NextResponse.json(
      { error: `Failed to pull score from MQTT: ${(error as Error).message}` },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
