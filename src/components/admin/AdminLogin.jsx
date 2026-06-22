import { useState } from 'react';

const ADMIN_PASSWORD = 'Qa12345678';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('Неверный пароль');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Вход в админ-панель</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          autoFocus
        />
        {error ? <p className="text-red-500 text-xs">{error}</p> : null}
        <button type="submit" className="w-full bg-brand text-white font-semibold rounded-md py-2.5 text-sm">
          Войти
        </button>
        <a href="?" className="block text-center text-xs text-gray-400">
          Назад на главную
        </a>
      </form>
    </div>
  );
}
