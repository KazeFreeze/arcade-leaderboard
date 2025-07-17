// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Trophy, Medal, Award, Crown, Zap, Star, RefreshCw } from 'lucide-react';

// This line is added to ensure the page is always dynamically rendered on the server.
export const dynamic = "force-dynamic";

// Define the structure of a score object from your API
interface Score {
  id: number;
  name: string;
  score: number;
  gamemode: string;
  datetime: string; // This will be a string from the API
}

// Define the structure for a game mode from your API
interface Game {
  id: string;
  name:string;
  icon: string;
}

// Define the structure for a pending score
interface PendingScore {
    id: number;
    score: number;
    gamemode: string;
    created_at: string;
}

// Helper function to generate a random name
const generateRandomName = (): string => {
    const adjectives = ['Cyber', 'Robo', 'Giga', 'Mega', 'Hyper', 'Atomic', 'Cosmic', 'Galactic', 'Quantum', 'Zero'];
    const nouns = ['Striker', 'Blaster', 'Hunter', 'Raptor', 'Viper', 'Shadow', 'Knight', 'Ninja', 'Phantom', 'Spectre'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${adj}${noun}${num}`;
};


// Fetcher function for SWR to get data from the API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ArcadeLeaderboard = () => {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [animateScores, setAnimateScores] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState<PendingScore | null>(null);
  const [inputName, setInputName] = useState('');
  
  const { mutate } = useSWRConfig();

  // Fetch available game modes from your API
  const { data: games, error: gamesError } = useSWR<Game[]>('/api/get-gamemodes', fetcher);

  // Fetch scores for the selected game from your API
  const { data: scores, error: scoresError } = useSWR<Score[]>(
    selectedGame ? `/api/get-scores?gamemode=${selectedGame}` : null,
    fetcher
  );

  const { data: fetchedPendingScore } = useSWR<PendingScore | null>('/api/get-pending-score', fetcher, {
    refreshInterval: 5000,
    revalidateOnMount: true,
    dedupingInterval: 0,
  });

  // DEBUGGING: Log fetched data and errors to the browser console
  useEffect(() => {
    console.log("Fetched games from API:", games);
    if (gamesError) console.error("Error fetching games:", gamesError);
  }, [games, gamesError]);

  useEffect(() => {
    if (selectedGame) {
        console.log(`Fetched scores for gamemode '${selectedGame}':`, scores);
        if (scoresError) console.error(`Error fetching scores for ${selectedGame}:`, scoresError);
    }
  }, [scores, scoresError, selectedGame]);


  // On initial page load, run a cleanup of any expired pending scores.
  useEffect(() => {
    const cleanupPendingScores = async () => {
      try {
        await fetch('/api/cleanup-pending', { method: 'POST' });
        mutate('/api/get-pending-score');
      } catch (error) {
        console.error('Failed to cleanup pending scores:', error);
      }
    };
    cleanupPendingScores();
  }, [mutate]);


  // Effect to open the modal when a pending score is detected
  useEffect(() => {
    if (fetchedPendingScore && fetchedPendingScore.id) {
      setPendingScore(fetchedPendingScore);
      setIsModalOpen(true);
    } else {
      setPendingScore(null);
      setIsModalOpen(false);
    }
  }, [fetchedPendingScore]);

  // Set the initial selected game once the game modes have loaded
  useEffect(() => {
    if (games && games.length > 0 && !selectedGame) {
      console.log("Setting initial game to:", games[0].id);
      setSelectedGame(games[0].id);
    }
  }, [games, selectedGame]);

  // Animation effect when changing games
  useEffect(() => {
    if(selectedGame){
        setAnimateScores(true);
        const timer = setTimeout(() => setAnimateScores(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [selectedGame]);

  const handleNameUpdate = async (name: string) => {
    if (!name.trim() || !pendingScore?.id) return;

    try {
      const res = await fetch('/api/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scoreId: pendingScore.id }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setInputName('');
        setPendingScore(null);
        mutate('/api/get-pending-score', null, { revalidate: false });
        mutate(`/api/get-scores?gamemode=${selectedGame}`);
      } else {
        console.error('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };


  const handleRandomizeName = () => {
    const randomName = generateRandomName();
    handleNameUpdate(randomName);
  };

  // Function to manually refresh leaderboard data
  const handleRefresh = () => {
    console.log("Refreshing data...");
    mutate('/api/get-gamemodes');
    if (selectedGame) {
      mutate(`/api/get-scores?gamemode=${selectedGame}`);
    }
  };

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50';
      case 2: return 'text-gray-300 bg-gray-300/20 border-gray-300/50';
      case 3: return 'text-amber-600 bg-amber-600/20 border-amber-600/50';
      default: return 'text-purple-400 bg-purple-400/20 border-purple-400/50';
    }
  };

  const getGameIcon = (gameId: string) => {
    const game = games?.find(g => g.id === gameId);
    return game ? game.icon : '🕹️';
  }

  // Loading and error states
  if (gamesError) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">Error loading games. Check browser console for details.</div>
  if (scoresError) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">Error loading scores. Check browser console for details.</div>
  if (!games) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-cyan-400">Loading Games...</div>


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 font-sans">
      {isModalOpen && pendingScore && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl p-8 shadow-lg shadow-cyan-500/50 text-center max-w-md w-full m-4">
            <h2 className="text-4xl font-bold text-cyan-300 font-mono mb-2">NEW HIGH SCORE!</h2>
            <p className="text-gray-400 mb-4">Enter your name for the hall of fame!</p>
            <div className="bg-black/50 p-4 rounded-lg mb-6">
                <div className="text-xl text-purple-400 font-mono">SCORE</div>
                <div className="text-5xl text-white font-bold">{pendingScore.score.toLocaleString()}</div>
                <div className="text-md text-gray-400 font-mono mt-2">in {pendingScore.gamemode}</div>
            </div>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value.substring(0, 15))}
              maxLength={15}
              placeholder="ENTER YOUR NAME"
              className="w-full bg-gray-800 border-2 border-purple-500 rounded-lg p-4 text-center text-2xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleNameUpdate(inputName)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg text-lg transition-transform hover:scale-105"
              >
                SUBMIT NAME
              </button>
              <button
                onClick={handleRandomizeName}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg text-lg transition-transform hover:scale-105"
              >
                RANDOMIZE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 animate-pulse">
            Laser Target Game
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl text-cyan-300">
            <Zap className="w-8 h-8" />
            <span className="font-mono">HIGH SCORES</span>
            <Zap className="w-8 h-8" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 border-2 ${
                selectedGame === game.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-300 shadow-lg shadow-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              <span className="mr-2">{getGameIcon(game.id)}</span>
              {game.name}
            </button>
          ))}
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-cyan-300 font-mono">
              {games.find(g => g.id === selectedGame)?.name || 'LEADERBOARD'}
            </h2>
            <div className="flex items-center gap-4">
               <div className="text-cyan-400 text-sm font-mono">
                 LAST UPDATED: {new Date().toLocaleTimeString()}
               </div>
               <button onClick={handleRefresh} className="text-cyan-400 hover:text-white transition-colors" title="Refresh Data">
                 <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '2s' }} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4 text-cyan-300 font-bold text-sm uppercase tracking-wider border-b border-cyan-500/30 pb-2">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-4">PLAYER</div>
            <div className="col-span-2 text-right">SCORE</div>
            <div className="col-span-2 text-center">GAMEMODE</div>
            <div className="col-span-3 text-center">DATE ACHIEVED</div>
          </div>

          <div className="space-y-2">
            {games && games.length > 0 ? (
              <>
                {!scores ? (
                  <div className="text-center text-gray-400 py-8 col-span-12">Loading scores...</div>
                ) : scores.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 col-span-12">No scores recorded for this game yet. Be the first!</div>
                ) : (
                  scores.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-all duration-500 hover:scale-105 ${
                        getRankColor(index + 1)
                      } ${animateScores ? 'animate-pulse' : ''}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="col-span-1 text-center font-bold text-2xl">
                        #{index + 1}
                      </div>
                      <div className="col-span-4 font-mono text-lg font-bold">
                        {entry.name}
                      </div>
                      <div className="col-span-2 text-right font-mono text-xl font-bold">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-center font-mono text-sm">
                        {entry.gamemode}
                      </div>
                      <div className="col-span-3 text-center font-mono text-sm">
                        {new Date(entry.datetime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8 col-span-12">No games have been played yet. Be the first!</div>
            )}
          </div>
          
          <div className="mt-8 text-center text-cyan-400 text-sm font-mono">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span>🏆 HALL OF FAME 🏆</span>
              <span>•</span>
              <span>INSERT COIN TO PLAY</span>
              <span>•</span>
              <span>BEAT THE HIGH SCORE!</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4 text-center">
            <div className="text-purple-400 text-2xl font-bold">
              {scores && scores.length > 0 ? scores[0].score.toLocaleString() : 'N/A'}
            </div>
            <div className="text-purple-300 text-sm font-mono">HIGHEST SCORE</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 text-center">
            <div className="text-cyan-400 text-2xl font-bold">
              {scores?.length || 0}
            </div>
            <div className="text-cyan-300 text-sm font-mono">TOTAL PLAYERS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadeLeaderboard;
