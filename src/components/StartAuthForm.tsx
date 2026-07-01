import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Props = {
  onReady: () => void;
};

export function StartAuthForm({ onReady }: Props) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) onReady();
    });
  }, [onReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email: toAuthEmail(login), password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }
    onReady();
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  };

  if (!showSignIn) {
    return (
      <div className="start-auth">
        <strong>Выбери вход</strong>
        <div className="start-actions">
          <button type="button" className="start-button" onClick={onReady}>
            Войти как гость
          </button>
          <button type="button" className="start-button secondary" onClick={() => setShowSignIn(true)}>
            Войти
          </button>
        </div>
        <button type="button" className="google-button" disabled={busy} onClick={handleGoogleSignIn}>
          Войти через Google
        </button>
        {message && <small className="auth-message">{message}</small>}
      </div>
    );
  }

  return (
    <form className="start-auth" onSubmit={handleSubmit}>
      <strong>Вход</strong>
      <input
        type="text"
        placeholder="логин или email"
        value={login}
        onChange={(event) => setLogin(event.target.value)}
        minLength={3}
        required
      />
      <input
        type="password"
        placeholder="пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
      />
      <button type="submit" className="start-button" disabled={busy}>
        {busy ? 'Подожди...' : 'Войти'}
      </button>
      <button type="button" className="google-button" disabled={busy} onClick={handleGoogleSignIn}>
        Войти через Google
      </button>
      <button type="button" className="link-button" onClick={() => setShowSignIn(false)}>
        Назад
      </button>
      {message && <small className="auth-message">{message}</small>}
    </form>
  );
}

const toAuthEmail = (login: string) => {
  const trimmed = login.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  const safeLogin = trimmed.replace(/[^a-z0-9._-]/g, '');
  return `${safeLogin}@almadi.local`;
};
