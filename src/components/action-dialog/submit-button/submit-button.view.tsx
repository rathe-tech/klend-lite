import { ProgressIcon } from "@components/progress-icon";
import { ActionKind } from "../action-dialog.model";
import * as css from "./submit-button.css";

export const SubmitButton = ({
  kind,
  inProgress,
  onSubmit,
}: {
  kind: ActionKind,
  inProgress: boolean,
  onSubmit: () => void,
}) =>
  <button
    disabled={inProgress}
    className={css.submitButton}
    onClick={onSubmit}
  >
    {inProgress && <ProgressIcon.Default />}
    {chooseCaption(kind, inProgress)}
  </button>

function chooseCaption(kind: ActionKind, inProgress: boolean) {
  if (inProgress) {
    return "Processing...";
  }

  switch (kind) {
    case ActionKind.Borrow:
      return "Borrow";
    case ActionKind.Repay:
      return "Repay";
    case ActionKind.Supply:
      return "Supply";
    case ActionKind.Withdraw:
      return "Withdraw";
    default:
      throw new Error(`Unsupported action kind: ${kind}`);
  }
}