import { findStarInstances } from "./nodeTraversal";

/**
 * Convert a rating float (0-5) to an array of 5 fill states.
 * Each star is "0" (empty), "50" (half), or "100" (full).
 *
 * Example: 3.7 -> ["100","100","100","50","0"]
 */
export function ratingToStarFills(
  rating: number
): Array<"0" | "50" | "100"> {
  const fills: Array<"0" | "50" | "100"> = [];
  for (let i = 0; i < 5; i++) {
    const diff = rating - i;
    if (diff >= 0.75) {
      fills.push("100");
    } else if (diff >= 0.25) {
      fills.push("50");
    } else {
      fills.push("0");
    }
  }
  return fills;
}

/**
 * Apply star fill states to the star instances inside the BETA Rating > Stars
 * frame. Tries setting the `fill` variant property on each star instance.
 */
export async function setStarRating(
  root: SceneNode & ChildrenMixin,
  fillStates: Array<"0" | "50" | "100">
): Promise<void> {
  const starInstances = findStarInstances(root);

  for (let i = 0; i < Math.min(starInstances.length, fillStates.length); i++) {
    const star = starInstances[i];
    try {
      star.setProperties({ fill: fillStates[i] });
    } catch {
      // Property name might differ — try common alternatives
      try {
        star.setProperties({ Fill: fillStates[i] });
      } catch {
        // Skip gracefully if no fill property exists
      }
    }
  }
}
