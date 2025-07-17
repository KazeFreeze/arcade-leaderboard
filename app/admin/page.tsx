// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Shield, Trash2, PlusCircle, AlertTriangle, CheckCircle, Gamepad2, LogIn, LogOut } from 'lucide-react';

// Define the structure for a game mode from your API
interface Game {
  id: string;
  name: string;
  icon: string;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminPage = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // State for the test score form
  const [testName, setTestName] = useState('');
  const [testScore, setTestScore] = useState('');
  const [selectedGamemode, setSelectedGamemode] = useState('');
  const [newGamemode, setNewGamemode] = useState('');
  const [isAddingNewGamemode, setIsAddingNewGamemode] = useState(false);
  
  const { mutate } = useSWRConfig();

  // Fetch available game modes for the dropdown
  const { data: gamemodes, error: gamemodesError } = useSWR<Game[]>('/api/get-gamemodes', fetcher);

  // Set the initial selected game mode once they have loaded
  useEffect(() => {
    if (gamemodes && gamemodes.length > 0 && !selectedGamemode) {
      setSelectedGamemode(gamemodes[0].id);
    }
  }, [gamemodes, selectedGamemode]);

  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleResetDatabase = async () => {
    // Using a custom modal/confirm is better, but for an admin panel, this is acceptable.
    if (!window.confirm('Are you sure you want to reset the entire database? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Database has been successfully reset!' });
        mutate('/api/get-gamemodes'); // Re-fetch gamemodes
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
    
    const gamemodeToSubmit = isAddingNewGamemode ? newGamemode.trim().toLowerCase().replace(/\s+/g, '-') : selectedGamemode;

    if (!gamemodeToSubmit) {
       setMessage({ type: 'error', text: 'Gamemode is required.' });
       return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/add-test-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testName,
          score: parseInt(testScore, 10),
          gamemode: gamemodeToSubmit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Test score for ${testName} added successfully!` });
        // Clear form
        setTestName('');
        setTestScore('');
        setNewGamemode('');
        if (isAddingNewGamemode) {
          mutate('/api/get-gamemodes'); // Re-fetch gamemodes if a new one was added
          setIsAddingNewGamemode(false); // Switch back to dropdown
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-4 flex items-center justify-center">
            <p className="text-2xl text-yellow-400 font-mono animate-pulse">Authenticating...</p>
        </div>
    )
  }

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
          
          {/* --- Authentication Section --- */}
          <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-red-300 font-mono">
                <Shield size={28} />
                Admin Authentication
              </h2>
              <p className="text-gray-400 mt-1">
                {session ? `Signed in as ${session.user?.email}` : 'Not signed in.'}
              </p>
            </div>
            {session ? (
              <button onClick={() => signOut()} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105">
                <LogOut />
                Sign Out
              </button>
            ) : (
               <button onClick={() => signIn('github')} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105">
                <LogIn />
                Sign in with GitHub
              </button>
            )}
          </div>
          
          {/* Conditional Rendering based on Auth Status */}
          {session && isAdmin ? (
            <>
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
                    
                    {/* Gamemode Selection Logic */}
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 text-cyan-300 font-mono">
                                <Gamepad2 size={20}/>
                                Gamemode
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isAddingNewGamemode}
                                    onChange={() => setIsAddingNewGamemode(!isAddingNewGamemode)}
                                    className="form-checkbox h-5 w-5 bg-gray-700 border-gray-500 text-cyan-500 rounded focus:ring-cyan-400"
                                />
                                <span>Add New</span>
                            </label>
                        </div>

                        {isAddingNewGamemode ? (
                            <input
                                type="text"
                                value={newGamemode}
                                onChange={(e) => setNewGamemode(e.target.value)}
                                placeholder="Enter New Gamemode Name"
                                required
                                className="w-full bg-gray-700 border-2 border-gray-500 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                        ) : (
                            <select
                                value={selectedGamemode}
                                onChange={(e) => setSelectedGamemode(e.target.value)}
                                required={!isAddingNewGamemode}
                                disabled={gamemodesError || !gamemodes}
                                className="w-full bg-gray-700 border-2 border-gray-500 rounded-lg p-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                                {gamemodes ? gamemodes.map(game => (
                                    <option key={game.id} value={game.id}>{game.name}</option>
                                )) : <option>Loading...</option>}
                            </select>
                        )}
                    </div>

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
            </>
          ) : (
             <div className="text-center py-10">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">ACCESS DENIED</h2>
                <p className="text-gray-300">
                    {session ? "You are not authorized to view this page." : "Please sign in to manage the leaderboard."}
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
