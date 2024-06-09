import { useCallback, useEffect, useRef } from "react";
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

const CLOSE_TIMEOUT = 5_000; //ms

export const Notification = ({
  notification,
  close,
}: {
  notification: NotificationProps,
  close: (id: string) => void,
}) => {
  const animationId = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const isPaused = useRef(false);

  const onClose = useCallback(() => {
    if (animationId.current != null) {
      window.cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
    close(notification.id);
  }, []);
  const onPointerEnter = useCallback(() => isPaused.current = true, []);
  const onPointerLeave = useCallback(() => isPaused.current = false, []);

  useEffect(() => {
    if (notification.closable && animationId.current == null) {
      let [start, passed] = [performance.now(), 0];
      const tick = () => {
        const now = performance.now();
        [start, passed] = isPaused.current ? [now, passed] : [now, passed + (now - start)];
        passed >= CLOSE_TIMEOUT ? onClose() : (animationId.current = window.requestAnimationFrame(tick));
      }
      animationId.current = window.requestAnimationFrame(tick);
    }
  }, [notification.closable]);

  return (
    <div
      className={pickClassName(notification.kind)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {notification.closable && <CloseButton onClick={onClose} />}
      <div className={css.content}>
        {notification.message}
      </div>
    </div>
  );
};

const CloseButton = ({
  onClick,
}: {
  onClick: () => void,
}) =>
  <div className={css.close} onClick={onClick} />

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