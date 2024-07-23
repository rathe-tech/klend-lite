import { useCallback, useState } from "react";
import { useSettings } from "@components/settings-context";
import { UIUtils, TokenAmount } from "@misc/utils";
import { NotificationKind, useNotifications } from "@components/notifications";

export function useSettingsForm() {
  const { notify } = useNotifications();
  const { priorityFee: initialPriorityFee, changePriorityFee, isOpen, close } = useSettings();

  const [priorityFee, setPriorityFee] = useState(() => UIUtils.toUINumber(initialPriorityFee, 9));
  const save = useCallback(({ priorityFee }: { priorityFee: string }) => {
    try {
      const nativePriorityFee = TokenAmount.toNative(priorityFee, 9);
      if (nativePriorityFee == null) throw new Error("No value provided");
      changePriorityFee(nativePriorityFee);
      close();
    } catch (e: any) {
      notify({
        id: crypto.randomUUID(),
        kind: NotificationKind.Error,
        message: e.toString(),
        closable: true,
      });
    }
  }, []);
  return { priorityFee, setPriorityFee, isOpen, save, close };
}