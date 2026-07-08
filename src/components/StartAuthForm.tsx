import { useEffect, useState } from 'react';
import { useLanguage, type Language } from '../lib/i18n';
import { supabase } from '../lib/supabase';

type Props = {
  onReady: () => void;
};

export function StartAuthForm({ onReady }: Props) {
  const { language } = useLanguage();
  const text = authText[language];
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
        <strong>{text.chooseSignIn}</strong>
        <div className="start-actions">
          <button type="button" className="start-button" onClick={onReady}>
            {text.guest}
          </button>
          <button type="button" className="start-button secondary" onClick={() => setShowSignIn(true)}>
            {text.signIn}
          </button>
        </div>
        <button type="button" className="google-button" disabled={busy} onClick={handleGoogleSignIn}>
          {text.google}
        </button>
        {message && <small className="auth-message">{message}</small>}
      </div>
    );
  }

  return (
    <form className="start-auth" onSubmit={handleSubmit}>
      <strong>{text.signIn}</strong>
      <input
        type="text"
        placeholder={text.loginPlaceholder}
        value={login}
        onChange={(event) => setLogin(event.target.value)}
        minLength={3}
        required
      />
      <input
        type="password"
        placeholder={text.passwordPlaceholder}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
      />
      <button type="submit" className="start-button" disabled={busy}>
        {busy ? text.wait : text.signIn}
      </button>
      <button type="button" className="google-button" disabled={busy} onClick={handleGoogleSignIn}>
        {text.google}
      </button>
      <button type="button" className="link-button" onClick={() => setShowSignIn(false)}>
        {text.back}
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

const authText: Record<Language, {
  back: string;
  chooseSignIn: string;
  google: string;
  guest: string;
  loginPlaceholder: string;
  passwordPlaceholder: string;
  signIn: string;
  wait: string;
}> = {
  en: {
    back: 'Back',
    chooseSignIn: 'Choose sign in',
    google: 'Sign in with Google',
    guest: 'Continue as guest',
    loginPlaceholder: 'login or email',
    passwordPlaceholder: 'password',
    signIn: 'Sign in',
    wait: 'Wait...',
  },
  ru: {
    back: 'Назад',
    chooseSignIn: 'Выбери вход',
    google: 'Войти через Google',
    guest: 'Войти как гость',
    loginPlaceholder: 'логин или email',
    passwordPlaceholder: 'пароль',
    signIn: 'Войти',
    wait: 'Подожди...',
  },
  kk: {
    back: 'Артқа',
    chooseSignIn: 'Кіру түрін таңда',
    google: 'Google арқылы кіру',
    guest: 'Қонақ ретінде кіру',
    loginPlaceholder: 'логин немесе email',
    passwordPlaceholder: 'құпиясөз',
    signIn: 'Кіру',
    wait: 'Күте тұр...',
  },
};
