import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { useLanguage, type Language } from '../lib/i18n';

type Props = {
  url: string;
};

export function YouTubeMusicPlayer({ url }: Props) {
  const { language } = useLanguage();
  const text = playerText[language];
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mode, setMode] = useState<'full' | 'compact' | 'hidden'>('full');
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const videoId = getYouTubeVideoId(url);

  useEffect(() => {
    sendPlayerCommand(iframeRef.current, 'setVolume', [volume]);
    sendPlayerCommand(iframeRef.current, muted ? 'mute' : 'unMute');
  }, [muted, volume]);

  if (!videoId) return null;

  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&loop=1&playlist=${videoId}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const style = { left: position.x, bottom: position.y };

  const handleDragStart = (event: PointerEvent<HTMLElement>) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startPosition = position;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const move = (moveEvent: globalThis.PointerEvent) => {
      setPosition({
        x: Math.max(8, startPosition.x + moveEvent.clientX - startX),
        y: Math.max(8, startPosition.y - moveEvent.clientY + startY),
      });
    };

    const stop = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', stop);
      target.removeEventListener('pointercancel', stop);
    };

    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', stop);
    target.addEventListener('pointercancel', stop);
  };

  return (
    <>
      {mode === 'hidden' && (
        <button type="button" className="youtube-restore" onClick={() => setMode('compact')}>
          {text.music}
        </button>
      )}
      <aside className={`youtube-player ${mode}`} style={style} aria-label={text.aria}>
        <div className="youtube-player-head" onPointerDown={handleDragStart}>
          <strong>{text.music}</strong>
          <span onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setMode(mode === 'compact' ? 'full' : 'compact')}>
              {mode === 'compact' ? '+' : '-'}
            </button>
            <button type="button" onClick={() => setMode('hidden')}>x</button>
          </span>
        </div>
        {mode === 'full' && <p>{text.unavailable}</p>}
        <div className="youtube-volume">
          <button type="button" onClick={() => setMuted((current) => !current)}>
            {muted ? 'Mute' : 'Vol'}
          </button>
          <input
            max="100"
            min="0"
            type="range"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
        <iframe
          allow="encrypted-media; picture-in-picture"
          onLoad={() => {
            sendPlayerCommand(iframeRef.current, 'setVolume', [volume]);
            sendPlayerCommand(iframeRef.current, muted ? 'mute' : 'unMute');
          }}
          ref={iframeRef}
          src={src}
          title={text.aria}
        />
        {mode === 'full' && <a href={watchUrl} rel="noreferrer" target="_blank">{text.open}</a>}
      </aside>
    </>
  );
}

const playerText: Record<Language, { aria: string; music: string; open: string; unavailable: string }> = {
  ru: {
    aria: 'YouTube музыка',
    music: 'Музыка',
    open: 'Открыть на YouTube',
    unavailable: 'Если пишет «Видео недоступно», автор ролика запретил показ на других сайтах.',
  },
  en: {
    aria: 'YouTube music',
    music: 'Music',
    open: 'Open on YouTube',
    unavailable: 'If it says “Video unavailable”, the creator blocked playback on other sites.',
  },
  kk: {
    aria: 'YouTube музыкасы',
    music: 'Музыка',
    open: 'YouTube-та ашу',
    unavailable: 'Егер “Видео қолжетімсіз” десе, автор басқа сайттарда көрсетуді бұғаттаған.',
  },
};

const getYouTubeVideoId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return cleanId(url.pathname.slice(1));
    if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'music.youtube.com') return null;
    if (url.pathname === '/watch') return cleanId(url.searchParams.get('v') ?? '');
    if (url.pathname.startsWith('/shorts/')) return cleanId(url.pathname.split('/')[2] ?? '');
    if (url.pathname.startsWith('/embed/')) return cleanId(url.pathname.split('/')[2] ?? '');
    if (url.pathname.startsWith('/live/')) return cleanId(url.pathname.split('/')[2] ?? '');
  } catch {
    return null;
  }

  return null;
};

const cleanId = (value: string) => {
  const id = value.split('?')[0]?.split('&')[0] ?? '';
  return /^[a-zA-Z0-9_-]{6,}$/.test(id) ? id : null;
};

const sendPlayerCommand = (iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) => {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube.com');
};
