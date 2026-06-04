// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

/**
 * Returns an ellipsized text that fits in between a calculated distance
 * (not overlapping on other nodes)
 *
 * @param text Text to be ellipsized
 * @param nodePos Current node position in the 2D co-ordinate
 * @param parentNodePos Parent node position in the 2D co-ordinate
 * @param fontSize Text Size used in the UI element
 * @returns Calculated ellipsized text
 */
export const getEllipsizedText = (
  text: string,
  nodePos: number,
  parentNodePos: number,
  fontSize: number
) => {
  // Observed width ratio of `W` and `f` (i.e 3 / 2)
  const charHWRatio = 3 / 2;
  const minCharSize = 6;

  const distance = Math.abs(nodePos - (parentNodePos || 0));
  const charSize = fontSize / charHWRatio || minCharSize;

  let maxCharWidth = Math.floor(distance / charSize);
  if (maxCharWidth === 0) {
    return text;
  }

  // Compensating for 3 dots and 1 space in ellipsized text
  maxCharWidth -= 4;

  return (
    text.substring(0, maxCharWidth) + (text.length > maxCharWidth ? ' ...' : '')
  );
};
