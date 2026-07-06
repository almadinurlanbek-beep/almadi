import type { EventNotification } from '../lib/useEventNotifications';

type Props = {
  notifications: EventNotification[];
  onDismiss: (id: string) => void;
};

export function EventNotifications({ notifications, onDismiss }: Props) {
  if (notifications.length === 0) return null;

  return (
    <div className="event-notifications">
      {notifications.map((notification) => (
        <button
          type="button"
          className={`event-toast ${notification.kind}`}
          key={notification.id}
          onClick={() => onDismiss(notification.id)}
        >
          <strong>{getTitle(notification.kind)}</strong>
          <span>{notification.text}</span>
        </button>
      ))}
    </div>
  );
}

const getTitle = (kind: EventNotification['kind']) => {
  if (kind === 'success') return 'Готово';
  if (kind === 'warning') return 'Важно';
  return 'Событие';
};
