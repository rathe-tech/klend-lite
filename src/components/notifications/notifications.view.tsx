import { createContext, useCallback, useContext, useState } from "react";
import * as css from "./notifications.css";

const Notification = ({ notification, close }: { notification: NotificationProps, close: (id: string) => void }) =>
  <div className={css.notification}>
    {notification.closable &&
      <div className={css.close} onClick={() => close(notification.id)}>
        &#x2715;
      </div>
    }
    {notification.content}
  </div>

interface NotificationContext {
  notify: (notification: NotificationProps) => void;
}

export interface NotificationProps {
  id: string;
  content: React.ReactNode;
  closable?: boolean;
}

const NotificationContext = createContext<NotificationContext | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const notify = useCallback((notification: NotificationProps) => {
    setNotifications(notifications => {
      const index = notifications.findIndex(x => x.id === notification.id);
      if (index === -1) {
        return [...notifications, notification];
      } else {
        return [...notifications.slice(0, index), notification, ...notifications.slice(index + 1)];
      }
    });
  }, []);

  const close = useCallback((id: string) => {
    setNotifications(notifications => {
      const index = notifications.findIndex(x => x.id === id);
      if (index === -1) {
        return notifications;
      } else {
        return [...notifications.slice(0, index), ...notifications.slice(index + 1)];
      }
    })
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className={css.layout}>
        {notifications.map(notification =>
          <Notification
            key={notification.id}
            close={close}
            notification={notification}
          />
        )}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context == null) {
    throw new Error("Could not use NotificationContext outside NotificationProvider");
  }

  return context;
}