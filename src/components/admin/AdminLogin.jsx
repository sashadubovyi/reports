import { useState } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth.js';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Вход в админ-панель</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        {error ? <p className="text-red-600 text-xs">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand text-white font-semibold rounded-md py-2.5 text-sm disabled:opacity-50"
        >
          {submitting ? 'Вход...' : 'Войти'}
        </button>
        <a href="?" className="block text-center text-xs text-gray-500">
          Назад на главную
        </a>
      </form>
    </main>
  );
}
