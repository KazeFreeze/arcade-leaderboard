// app/admin/page.tsx
'use client';

import React, { useState } from 'react';
import { Shield, Trash2, PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for the test score form
  const [testName, setTestName] = useState('');
  const [testScore, setTestScore] = useState('');
  const [testGamemode, setTestGamemode] = useState('pac-man');

  const handleResetDatabase = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Password is required to perform this action.' });
      return;
    }
    if (!confirm('Are you sure you want to reset the entire database? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Database has been successfully reset!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage({ type: 'error', text: 'Password is required to add a score.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/add-test-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          name: testName,
          score: parseInt(testScore, 10),
          gamemode: testGamemode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Test score for ${testName} added successfully!` });
        // Clear form
        setTestName('');
        setTestScore('');
      } else {
        setMessage({ type: 'error', text: data.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-4 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-400 mb-4 font-press-start">
            ADMIN PANEL
          </h1>
          <p className="text-red-300 font-mono">Restricted Access</p>
        </div>

        {/* --- Main Admin Container --- */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6 shadow-2xl shadow-red-500/20">
          
          {/* --- Password Section --- */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-2xl font-bold text-red-300 font-mono mb-4">
              <Shield size={28} />
              Admin Authentication
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ADMIN PASSWORD"
              className="w-full bg-gray-800/50 border-2 border-red-500 rounded-lg p-4 text-center text-xl text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {message && (
            <div className={`flex items-center gap-4 p-4 mb-6 rounded-lg border-2 ${message.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300'}`}>
              {message.type === 'success' ? <CheckCircle /> : <AlertTriangle />}
              <span>{message.text}</span>
            </div>
          )}

          {/* --- Actions --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* --- Reset Database Section --- */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-400 font-mono mb-4">
                <Trash2 />
                Reset Database
              </h2>
              <p className="text-gray-400 mb-4 text-sm">
                This will completely wipe all scores and game modes from the leaderboard. This action is irreversible.
              </p>
              <button
                onClick={handleResetDatabase}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-3 rounded-lg text-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting...' : 'WIPE DATABASE'}
              </button>
            </div>

            {/* --- Add Test Score Section --- */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-400 font-mono mb-4">
                <PlusCircle />
                Add Test Score
              </h2>
              <form onSubmit={handleAddTestScore} className="space-y-4">
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Player Name"
                  required
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="number"
                  value={testScore}
                  onChange={(e) => setTestScore(e.target.value)}
                  placeholder="Score"
                  required
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <select
                  value={testGamemode}
                  onChange={(e) => setTestGamemode(e.target.value)}
                  required
                  className="w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="pac-man">PAC-MAN</option>
                  <option value="space-invaders">SPACE INVADERS</option>
                  <option value="tetris">TETRIS</option>
                  <option value="asteroids">ASTEROIDS</option>
                  <option value="frogger">FROGGER</option>
                </select>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg text-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'ADD SCORE'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
