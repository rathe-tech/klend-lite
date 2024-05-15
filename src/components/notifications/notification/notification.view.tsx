import { useCallback, useEffect, useRef, useState } from "react";
import * as css from "./notification.css";

export enum NotificationKind {
  Info,
  Error,
  Success,
}

export interface NotificationProps {
  id: string;
  kind: NotificationKind;
  message: React.ReactNode;
  closable?: boolean;
}

const CLOSE_TIMEOUT = 10_000; //ms
const CLOSE_CHECK_INTERVAL = 100;

export const Notification = ({
  notification,
  close,
}: {
  notification: NotificationProps,
  close: (id: string) => void,
}) => {
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const tillClose = useRef(CLOSE_TIMEOUT);

  const onClose = useCallback(() => {
    if (timerId.current != null) {
      clearInterval(timerId.current);
    }
    close(notification.id);
  }, []);

  useEffect(() => {
    if (notification.closable && timerId.current == null) {
      timerId.current = setInterval(() => {
        tillClose.current -= CLOSE_CHECK_INTERVAL;
        if (tillClose.current <= 0) {
          onClose();
        }
      }, CLOSE_CHECK_INTERVAL);
    }
  }, [notification.closable]);

  return (
    <div className={pickClassName(notification.kind)}>
      {notification.closable && <div className={css.close} onClick={onClose} />}
      <div className={css.content}>
        {notification.message}
      </div>
    </div>
  );
};

function pickClassName(kind: NotificationKind) {
  switch (kind) {
    case NotificationKind.Info:
      return css.notification.info;
    case NotificationKind.Error:
      return css.notification.error;
    case NotificationKind.Success:
      return css.notification.success;
    default:
      throw new Error(`Unsupported notification kind: ${kind}`);
  }
}