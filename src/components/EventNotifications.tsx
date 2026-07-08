import { useLanguage, type Language } from '../lib/i18n';
import type { EventNotification } from '../lib/useEventNotifications';

type Props = {
  notifications: EventNotification[];
  onDismiss: (id: string) => void;
};

export function EventNotifications({ notifications, onDismiss }: Props) {
  const { language } = useLanguage();
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
          <strong>{notificationTitle[language][notification.kind]}</strong>
          <span>{notification.text}</span>
        </button>
      ))}
    </div>
  );
}

const notificationTitle: Record<Language, Record<EventNotification['kind'], string>> = {
  ru: { info: 'Событие', success: 'Готово', warning: 'Важно' },
  en: { info: 'Event', success: 'Done', warning: 'Important' },
  kk: { info: 'Оқиға', success: 'Дайын', warning: 'Маңызды' },
};
