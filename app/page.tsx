'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';

// Define the structure of a score object
interface Score {
  id: number;
  name: string | null;
  score: number;
  gamemode: string;
  datetime: string;
  pending_name: boolean;
}

// Fetcher function for SWR to get data from the API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LeaderboardPage() {
  // State for handling the name input for the latest score
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // useSWR will fetch the data and automatically re-fetch on an interval
  const { data: scores, error: fetchError, mutate } = useSWR<Score[]>('/api/get-scores', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const pendingScore = scores?.find(score => score.pending_name);

  // Handle form submission to update the name
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update name');
      }
      
      setSuccessMessage('Name submitted successfully!');
      setName('');
      // Manually trigger a re-fetch of the scores data
      mutate();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
    }
  };
  
  // A simple loading state
  if (!scores && !fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-press-start text-arcade-blue text-2xl animate-pulse">Loading Scores...</div>
      </div>
    );
  }

  // An error state for fetching data
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-press-start text-red-500 text-2xl">Error loading scores. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arcade-bg p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-6xl font-press-start text-arcade-purple uppercase tracking-widest" style={{ textShadow: '3px 3px 0px #00ffff' }}>
            Leaderboard
          </h1>
        </header>

        {/* Section to add a name to the latest score */}
        {pendingScore && (
          <div className="mb-12 p-6 bg-gray-900/50 border-2 border-arcade-blue rounded-lg shadow-arcade-glow">
            <h2 className="font-press-start text-2xl text-arcade-blue mb-4">New High Score!</h2>
            <p className="mb-4 text-lg">A new score of <span className="font-bold text-arcade-purple">{pendingScore.score}</span> in '{pendingScore.gamemode}' mode is waiting for a name!</p>
            <form onSubmit={handleNameSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ENTER YOUR NAME"
                  className="flex-grow bg-black font-press-start text-white border-2 border-arcade-purple focus:border-arcade-blue focus:outline-none p-3 rounded-md transition-all"
                  maxLength={15}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-press-start bg-arcade-purple text-black px-6 py-3 rounded-md hover:bg-arcade-blue hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Name'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {successMessage && <p className="text-green-400 mt-2">{successMessage}</p>}
            </form>
          </div>
        )}

        {/* The leaderboard table */}
        <div className="overflow-x-auto">
          <table className="w-full font-press-start text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-arcade-purple">
                <th className="p-4 text-arcade-blue text-lg">Rank</th>
                <th className="p-4 text-arcade-blue text-lg">Name</th>
                <th className="p-4 text-arcade-blue text-lg text-right">Score</th>
                <th className="p-4 text-arcade-blue text-lg hidden md:table-cell">Mode</th>
                <th className="p-4 text-arcade-blue text-lg hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores && scores.map((s, index) => (
                <tr key={s.id} className={`border-b border-gray-700 ${s.pending_name ? 'bg-purple-900/30 animate-pulse' : ''}`}>
                  <td className="p-4 text-xl">#{index + 1}</td>
                  <td className="p-4 text-xl">{s.pending_name ? 'PENDING...' : s.name || '???'}</td>
                  <td className="p-4 text-xl text-right text-arcade-purple">{s.score}</td>
                  <td className="p-4 hidden md:table-cell">{s.gamemode}</td>
                  <td className="p-4 hidden md:table-cell">{new Date(s.datetime).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
