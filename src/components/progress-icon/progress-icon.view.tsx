import * as css from "./progress-icon.css";

export enum ProgressIconStyle {
  Default,
  Accent,
}

interface ProgressIconProps {
  style: ProgressIconStyle;
}

export const ProgressIcon = (props: ProgressIconProps) =>
  <div className={chooseClassName(props.style)} />

ProgressIcon.Default = () => <ProgressIcon style={ProgressIconStyle.Default} />
ProgressIcon.Accent = () => <ProgressIcon style={ProgressIconStyle.Accent} />

function chooseClassName(style: ProgressIconStyle) {
  switch (style) {
    case ProgressIconStyle.Accent:
      return css.circle.accent;
    case ProgressIconStyle.Default:
    default:
      return css.circle.default;
  }
}