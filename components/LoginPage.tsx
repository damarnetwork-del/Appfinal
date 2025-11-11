
import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'damar') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Damar Global Network</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Selamat datang, silakan login.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="mt-1 block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Login
            </button>
          </form>
        </div>
         <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">&copy; {new Date().getFullYear()} Damar Global Network</p>
      </div>
    </div>
  );
};

export default LoginPage;