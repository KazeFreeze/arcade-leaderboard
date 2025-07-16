'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

// Define the structure of a score object
interface Score {
  id: number;
  name: string;
  score: number;
  gamemode: string;
  datetime: string;
}

// Define the structure for a pending score
interface PendingScore {
  id: number;
  score: number;
  gamemode: string;
}

// Fetcher function for useSWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LeaderboardPage() {
  // State for the selected game mode
  const [selectedGamemode, setSelectedGamemode] = useState('Classic');
  // State for the user's input name
  const [inputName, setInputName] = useState('');
  // State to control the visibility of the name input modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold information about a score pending a name
  const [pendingScore, setPendingScore] = useState<PendingScore | null>(null);
  
  // Fetch available game modes
  const { data: gamemodes, error: gamemodesError } = useSWR<string[]>('/api/get-gamemodes', fetcher);
  // Fetch scores for the selected game mode
  const { data: scores, error: scoresError } = useSWR<Score[]>(`/api/get-scores?gamemode=${selectedGamemode}`, fetcher);

  // Effect to check for a pending score when the component mounts
  useEffect(() => {
    const checkForPendingScore = async () => {
      try {
        const response = await fetch('/api/get-pending-score');
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            setPendingScore(data);
            setIsModalOpen(true); // Open the modal if a pending score is found
          }
        }
      } catch (error) {
        console.error('Error checking for pending score:', error);
      }
    };

    checkForPendingScore();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for submitting a new score (for testing purposes)
  const handleAddScore = async () => {
    const newScore = {
      score: Math.floor(Math.random() * 10000),
      gamemode: selectedGamemode,
    };

    try {
      const response = await fetch('/api/add-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScore),
      });

      if (response.ok) {
        const data = await response.json();
        setPendingScore(data.score); // Set the new pending score
        setIsModalOpen(true); // Open the modal to ask for the name
        mutate(`/api/get-scores?gamemode=${selectedGamemode}`); // Revalidate the scores
      } else {
        const errorData = await response.json();
        console.error('Failed to add score:', errorData.error);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('An error occurred while adding the score:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Handler for submitting the user's name
  const handleNameSubmit = async () => {
    if (!inputName.trim()) {
      alert('Please enter a name.');
      return;
    }

    try {
      const response = await fetch('/api/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName }),
      });

      if (response.ok) {
        // If the name is updated successfully
        alert('Score submitted successfully!');
        setIsModalOpen(false);
        setPendingScore(null);
        setInputName('');
        mutate(`/api/get-scores?gamemode=${selectedGamemode}`); // Re-fetch scores to show the new name
      } else {
        // Handle expected errors from the API, like 404
        const errorData = await response.json();
        if (response.status === 404) {
          alert("Could not find a score to update. Your session might have expired. Please try playing again.");
          setIsModalOpen(false); // Close the modal as there's nothing to update
        } else {
          // Handle other server errors (500, etc.)
          alert(`Error: ${errorData.error || 'Failed to update name'}`);
        }
        console.error("Failed to update name:", errorData);
      }
    } catch (error) {
      console.error("An error occurred while updating the name:", error);
      alert("An unexpected error occurred. Please check the console.");
    }
  };
  
  return (
    <div className="bg-gray-900 text-white min-h-screen font-mono">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400 tracking-widest">ARCADE LEADERBOARD</h1>
        </header>

        {/* Game Mode Selection */}
        <div className="flex justify-center items-center mb-8 space-x-4">
          {gamemodesError && <div>Failed to load game modes.</div>}
          {!gamemodes && !gamemodesError && <div>Loading modes...</div>}
          {gamemodes?.map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedGamemode(mode)}
              className={`px-6 py-2 text-lg font-semibold rounded-md transition-all duration-300 ${
                selectedGamemode === mode
                  ? 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Add Score Button for testing */}
        <div className="text-center mb-8">
            <button
                onClick={handleAddScore}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
            >
                Add Random Score
            </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-2xl border border-gray-700">
          {scoresError && <div className="text-center text-red-400">Failed to load scores. Please try again.</div>}
          {!scores && !scoresError && <div className="text-center text-gray-400">Loading scores...</div>}
          {scores && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="p-4 text-lg text-yellow-400">Rank</th>
                  <th className="p-4 text-lg text-yellow-400">Name</th>
                  <th className="p-4 text-lg text-yellow-400">Score</th>
                  <th className="p-4 text-lg text-yellow-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={score.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                    <td className="p-4 text-xl">{index + 1}</td>
                    <td className="p-4 text-xl">{score.name}</td>
                    <td className="p-4 text-xl">{score.score}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(score.datetime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal for Name Input */}
      {isModalOpen && pendingScore && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-yellow-400">
            <h2 className="text-2xl font-bold mb-4">High Score!</h2>
            <p className="mb-2">You scored <span className="text-yellow-400 font-bold">{pendingScore.score}</span> in {pendingScore.gamemode}!</p>
            <p className="mb-4">Enter your name to claim your spot on the leaderboard:</p>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              maxLength={20}
              className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your name"
            />
            <div className="flex justify-end space-x-4">
               <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNameSubmit}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded"
              >
                Submit Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
