import { vars } from "@theme/vars.css";
import { keyframes, style } from "@vanilla-extract/css";

const shine = keyframes({
  "to": {
    backgroundPosition: "right -40px top 0",
  }
})

export const skeletonCell = style({
  display: "inline-block",
  backgroundColor: vars.color.buttonDefaultBackgroundRest,
  borderRadius: "4px",
  backgroundSize: "40px 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left -40px top 0",
  animation: `${shine} 1.75s ease infinite`,
  animationDelay: "0.15s",
  backgroundImage: "linear-gradient(90deg, #ffffff00, #ffffff2f, #ffffff00)",
});