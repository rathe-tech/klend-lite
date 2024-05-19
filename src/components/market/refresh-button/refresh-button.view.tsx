import { ProgressIcon } from "../../progress-icon";
import { RefreshState, useRefreshState } from "./refresh-button.model";
import * as css from "./refresh-button.css";

export const RefreshButton = () => {
  const { state, refresh } = useRefreshState();
  const isInProgress = RefreshState.isInProgress(state);

  return (
    <button
      className={css.refreshButton}
      disabled={isInProgress}
      onClick={() => refresh()}
    >
      {isInProgress && <ProgressIcon.Accent />}
      {RefreshState.humanize(state)}
    </button>
  );
};