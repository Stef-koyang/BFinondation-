'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('loggedIn', 'true');
      router.push('/dashboard');
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className={`flex h-screen items-center justify-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
      <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-md w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <img src="/logo-gauche.png" alt="Logo gauche" className="w-12 h-12" />
          <img src="/logo-droit.png" alt="Logo droit" className="w-12 h-12" />
        </div>

        <div className="flex justify-center mb-4">
          <img src="/logo-user.png" alt="Logo utilisateur" className="w-16 h-16" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <p className="text-sm text-blue-500 mb-4 cursor-pointer hover:underline">Mot de passe oublié ?</p>
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('');
                setPassword('');
              }}
              className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Déconnecter
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            >
              Mode {darkMode ? 'Jour' : 'Sombre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
