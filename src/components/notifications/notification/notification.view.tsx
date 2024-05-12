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

export const Notification = ({
  notification,
  close,
}: {
  notification: NotificationProps,
  close: (id: string) => void,
}) =>
  <div className={pickClassName(notification.kind)}>
    {notification.closable &&
      <div className={css.close} onClick={() => close(notification.id)}>
        &#x2715;
      </div>
    }
    <div className={css.content}>
      {notification.message}
    </div>
  </div>

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