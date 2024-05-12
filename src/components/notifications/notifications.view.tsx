import { createContext, useCallback, useContext, useState } from "react";
import { ArrayUtils } from "@misc/utils";
import { Notification, NotificationProps } from "./notification";
import * as css from "./notifications.css";

interface NotificationContext {
  notify: (notification: NotificationProps) => void;
}

const NotificationContext = createContext<NotificationContext | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const notify = useCallback((notification: NotificationProps) => {
    setNotifications(notifications => {
      const index = notifications.findIndex(x => x.id === notification.id);
      return (index === -1) ?
        ArrayUtils.unionWithScalar(notifications, notification) :
        ArrayUtils.replaceAt(notifications, index, notification);
    });
  }, []);

  const close = useCallback((id: string) => {
    setNotifications(notifications => {
      const index = notifications.findIndex(x => x.id === id);
      return (index === -1) ? notifications : ArrayUtils.removeAt(notifications, index);
    });
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