'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

// Define the structure of a score object from the API
interface ApiScore {
  id: number;
  name: string;
  score: number;
}

// Define the structure of an enriched score object for the frontend
interface ScoreEntry extends ApiScore {
    rank: number;
    initials: string;
    level: number;
}


// Define the structure for a game mode
interface Game {
  id: string;
  name: string;
  icon: string;
}

// Fetcher function for SWR to get data from the API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ArcadeLeaderboard = () => {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Fetch available game modes
  const { data: games, error: gamesError } = useSWR<Game[]>('/api/get-gamemodes', fetcher);

  // Fetch scores for the selected game
  const { data: apiScores, error: scoresError } = useSWR<ApiScore[]>(
    selectedGame ? `/api/get-scores?gamemode=${selectedGame}` : null,
    fetcher
  );

  // Set the initial selected game once the game modes have loaded
  useEffect(() => {
    if (games && games.length > 0 && !selectedGame) {
      setSelectedGame(games[0].id);
    }
  }, [games, selectedGame]);

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRankIcon = (rank: number) => {
    switch(rank) {
        case 1: return '👑';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '⭐';
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

  // Enrich scores with rank, initials, and level for display
  const scores: ScoreEntry[] | undefined = apiScores?.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    initials: entry.name.slice(0, 3).toUpperCase(),
    // Simulate level based on score for demonstration
    level: Math.floor(Math.sqrt(entry.score) / 100) + 1,
  }));

  const highestScore = scores && scores.length > 0 ? scores[0].score : 0;
  const totalPlayers = scores?.length || 0;
  const maxLevel = scores && scores.length > 0 ? Math.max(...scores.map(e => e.level)) : 0;

  if (gamesError) return <div className="flex items-center justify-center min-h-screen text-red-500">Error loading games.</div>
  if (!games) return <div className="flex items-center justify-center min-h-screen text-cyan-400">Loading Arcade...</div>

  return (
    <div className="max-w-6xl mx-auto relative z-10 p-4">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 neon-glow">
                ARCADE LEGENDS
            </h1>
            <div className="flex items-center justify-center gap-4 text-2xl text-cyan-300">
                <span className="text-3xl">⚡</span>
                <span className="font-bold tracking-wider">HIGH SCORES</span>
                <span className="text-3xl">⚡</span>
            </div>
            <div className="mt-2 text-sm text-cyan-400 font-mono">
                &gt;&gt;&gt; SELECT A GAME &lt;&lt;&lt;
            </div>
        </div>

        {/* Game Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
            {games.map((game) => (
                <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className={`game-card px-6 py-3 rounded-lg font-bold text-lg text-white ${selectedGame === game.id ? 'active' : ''}`}
                >
                    <span className="mr-2 text-2xl">{getGameIcon(game.id)}</span>
                    {game.name}
                </button>
            ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-cyan-300 neon-glow">
                    {games.find(g => g.id === selectedGame)?.name} LEADERBOARD
                </h2>
                <div className="text-cyan-400 text-sm font-mono">
                    LAST UPDATED: <span>{currentTime}</span>
                </div>
            </div>

            {/* Leaderboard Header */}
            <div className="grid grid-cols-12 gap-4 mb-4 text-cyan-300 font-bold text-sm uppercase tracking-wider border-b border-cyan-500/30 pb-2">
                <div className="col-span-1 text-center">RANK</div>
                <div className="col-span-1 text-center">INIT</div>
                <div className="col-span-4">PLAYER</div>
                <div className="col-span-3 text-right">SCORE</div>
                <div className="col-span-2 text-right">LEVEL</div>
                <div className="col-span-1 text-center">BADGE</div>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-2">
                {scoresError && <div className="text-center text-red-400 py-8 col-span-12">Failed to load scores.</div>}
                {!apiScores && !scoresError && <div className="text-center text-gray-400 py-8 col-span-12">Loading scores...</div>}
                {scores && scores.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={`leaderboard-entry grid grid-cols-12 gap-4 items-center p-4 rounded-lg border ${getRankColor(entry.rank)}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="col-span-1 text-center font-bold text-2xl">#{entry.rank}</div>
                        <div className="col-span-1 text-center font-mono text-lg font-bold bg-black/30 rounded px-2 py-1">{entry.initials}</div>
                        <div className="col-span-4 font-mono text-lg font-bold truncate">{entry.name}</div>
                        <div className="col-span-3 text-right font-mono text-xl font-bold">{entry.score.toLocaleString()}</div>
                        <div className="col-span-2 text-right font-mono text-lg">LVL {entry.level}</div>
                        <div className="col-span-1 text-center text-2xl">{getRankIcon(entry.rank)}</div>
                    </div>
                ))}
                {scores && scores.length === 0 && (
                    <div className="text-center text-gray-400 py-8 col-span-12">No scores recorded for this game yet. Be the first!</div>
                )}
            </div>

            {/* Footer */}
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

        {/* Additional Info Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4 text-center rank-badge">
                <div className="text-purple-400 text-2xl font-bold transition-all duration-500">{highestScore.toLocaleString()}</div>
                <div className="text-purple-300 text-sm font-mono">HIGHEST SCORE</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 text-center rank-badge">
                <div className="text-cyan-400 text-2xl font-bold">{totalPlayers}</div>
                <div className="text-cyan-300 text-sm font-mono">TOTAL PLAYERS</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-pink-500/30 p-4 text-center rank-badge">
                <div className="text-pink-400 text-2xl font-bold">{maxLevel}</div>
                <div className="text-pink-300 text-sm font-mono">MAX LEVEL</div>
            </div>
        </div>
    </div>
  );
};

export default ArcadeLeaderboard;
