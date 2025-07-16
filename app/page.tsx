'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Trophy, Medal, Award, Crown, Zap, Star } from 'lucide-react';

// Define the structure of a score object
interface Score {
  id: number;
  name: string;
  score: number;
  initials: string;
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
  const [animateScores, setAnimateScores] = useState(false);

  // Fetch available game modes
  const { data: games, error: gamesError } = useSWR<Game[]>('/api/get-gamemodes', fetcher);

  // Fetch scores for the selected game
  const { data: scores, error: scoresError } = useSWR<Score[]>(
    selectedGame ? `/api/get-scores?gamemode=${selectedGame}` : null,
    fetcher
  );

  // Set the initial selected game once the game modes have loaded
  useEffect(() => {
    if (games && games.length > 0 && !selectedGame) {
      setSelectedGame(games[0].id);
    }
  }, [games, selectedGame]);


  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-purple-400" />;
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

  useEffect(() => {
    if(selectedGame){
        setAnimateScores(true);
        const timer = setTimeout(() => setAnimateScores(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [selectedGame]);

  if (gamesError || scoresError) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">
              Error loading data. Please try refreshing the page.
          </div>
      )
  }

  if (!games) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-900 text-cyan-400">
              Loading games...
          </div>
      )
  }
  
  const getGameIcon = (gameId: string) => {
    const game = games?.find(g => g.id === gameId);
    if (game) return game.icon;

    // Default icons if not found
    const icons: { [key: string]: string } = {
        'pac-man': '🟡',
        'space-invaders': '👾',
        'tetris': '🟩',
        'asteroids': '💫',
        'frogger': '🐸',
    };
    return icons[gameId] || '🕹️';
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 font-sans">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 animate-pulse">
            ARCADE LEGENDS
          </h1>
          <div className="flex items-center justify-center gap-2 text-2xl text-cyan-300">
            <Zap className="w-8 h-8" />
            <span className="font-mono">HIGH SCORES</span>
            <Zap className="w-8 h-8" />
          </div>
        </div>

        {/* Game Selection */}
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

        {/* Leaderboard */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-cyan-300 font-mono">
              {games.find(g => g.id === selectedGame)?.name} LEADERBOARD
            </h2>
            <div className="text-cyan-400 text-sm font-mono">
              LAST UPDATED: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Leaderboard Header */}
          <div className="grid grid-cols-12 gap-4 mb-4 text-cyan-300 font-bold text-sm uppercase tracking-wider border-b border-cyan-500/30 pb-2">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-2 text-center">INITIALS</div>
            <div className="col-span-6">PLAYER</div>
            <div className="col-span-2 text-right">SCORE</div>
            <div className="col-span-1 text-center">BADGE</div>
          </div>

          {/* Leaderboard Entries */}
          <div className="space-y-2">
            {scores ? scores.map((entry, index) => (
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
                <div className="col-span-2 text-center font-mono text-lg font-bold bg-black/30 rounded px-2 py-1">
                  {entry.name.substring(0, 3).toUpperCase()}
                </div>
                <div className="col-span-6 font-mono text-lg font-bold">
                  {entry.name}
                </div>
                <div className="col-span-2 text-right font-mono text-xl font-bold">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-1 text-center">
                  {getRankIcon(index + 1)}
                </div>
              </div>
            )) : <div className="text-center text-gray-400 py-8">Loading scores...</div>}
             {scores && scores.length === 0 && (
              <div className="text-center text-gray-400 py-8 col-span-12">No scores recorded for this game yet. Be the first!</div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center text-cyan-400 text-sm font-mono">
            <div className="flex items-center justify-center gap-4">
              <span>🏆 HALL OF FAME 🏆</span>
            </div>
          </div>
        </div>

        {/* Additional Info Panel */}
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
