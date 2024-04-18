import * as css from "./skeleton-cell.css";

export const SkeletonCell = ({ width = "70px", height = "26px" }: { width?: string, height?: string }) =>
  <div
    className={css.skeletonCell}
    style={{ width, height }}
  />