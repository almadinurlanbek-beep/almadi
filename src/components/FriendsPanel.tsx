import { useState } from 'react';
import type { FriendItem } from '../lib/friends';

type Props = {
  friends: FriendItem[];
  loading: boolean;
  message: string | null;
  onAccept: (friendshipId: string) => void;
  onAdd: (email: string) => void;
  onViewCity: (friend: FriendItem) => void;
};

export function FriendsPanel({ friends, loading, message, onAccept, onAdd, onViewCity }: Props) {
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!email.trim()) return;
    onAdd(email);
    setEmail('');
  };

  return (
    <section className="panel friends-panel">
      <div className="friends-heading">
        <div>
          <p className="eyebrow">Друзья</p>
          <h3>Города друзей</h3>
        </div>
        <strong>{friends.filter((friend) => friend.status === 'accepted').length}</strong>
      </div>
      <form
        className="friend-add"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email друга" type="email" />
        <button type="submit" className="dark friend-add-button" disabled={loading || !email.trim()}>
          {loading ? 'Добавляем...' : 'Добавить друга'}
        </button>
      </form>
      {message && <small className="friend-message">{message}</small>}
      <div className="friend-list">
        {friends.length === 0 && <small>Добавь друга по email, чтобы смотреть его город.</small>}
        {friends.map((friend) => (
          <article className="friend-item" key={friend.friendshipId}>
            <div>
              <strong>{friend.displayName ?? friend.email}</strong>
              <small>{getStatusText(friend)}</small>
            </div>
            {friend.status === 'accepted' ? (
              <button type="button" className="dark friend-view-button" disabled={loading} onClick={() => onViewCity(friend)}>
                Смотреть город
              </button>
            ) : friend.incoming ? (
              <button type="button" className="dark" disabled={loading} onClick={() => onAccept(friend.friendshipId)}>
                Принять
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

const getStatusText = (friend: FriendItem) => {
  if (friend.status === 'accepted') return friend.email;
  return friend.incoming ? 'хочет добавить тебя' : 'заявка отправлена';
};
