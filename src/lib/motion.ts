/**
 * Flux CRM Motion System
 * Consistent durations, easings, and animation primitives.
 * Respect prefers-reduced-motion: reduce.
 */

export const MOTION_FAST = 120;
export const MOTION_MED = 180;
export const MOTION_SLOW = 240;

export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_IN = "cubic-bezier(0.7, 0, 0.84, 0)";
export const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

/** CSS transition string for enter (opacity only when reduce-motion) */
export function transitionEnter(
  props: string,
  duration = MOTION_MED,
  reduceMotionProps = "opacity"
): string {
  return `transition: ${props} ${duration}ms ${EASE_OUT}; @media (prefers-reduced-motion: reduce) { transition: ${reduceMotionProps} 120ms ${EASE_OUT}; }`;
}

export function transitionExit(
  props: string,
  duration = MOTION_MED,
  reduceMotionProps = "opacity"
): string {
  return `transition: ${props} ${duration}ms ${EASE_IN}; @media (prefers-reduced-motion: reduce) { transition: ${reduceMotionProps} 120ms ${EASE_IN}; }`;
}
