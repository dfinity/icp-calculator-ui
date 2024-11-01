import { type FillFunction, lerp } from "./lerp";

/**
 * spreads an array to the target size using interpolation.
 *
 * This function takes an initial array of values, a target size, and an
 * interpolation function (defaults to `lerp`). It returns a scaled and spread
 * version of the initial array to the target size using the specified
 * interpolation function.
 * The initial entries are spread as evenly as possible across the target size
 * and the gaps are filled with interpolated values using the specified.
 *
 * @param {Array} valuesToFill - The initial array of values.
 * @param {number} targetSize - The desired size of the resulting array.
 * @param {function} fillFunction - The interpolation function (default is lerp).
 * @returns {Array} The scaled and spread array.
 * @throws {Error} If the initial array is empty or target size is invalid.
 */
export const spreadArray = <T>(
  valuesToFill: T[],
  targetSize: number,
  fillFunction: FillFunction<T> = lerp as unknown as FillFunction<T>,
): T[] => {
  // Check that the valuesToFill array is not empty and that the target size is valid
  if (valuesToFill.length < 2) {
    throw new Error("valuesToFill array must have at least two values.");
  }
  if (targetSize < valuesToFill.length) {
    return valuesToFill.slice(0, targetSize);
  }
  // Create a copy of the valuesToFill array and add null values to it if necessary
  const valuesToAdd = targetSize - valuesToFill.length;
  const chunkArray = valuesToFill.map((value) => [value]);

  for (let i = 0; i < valuesToAdd; i++) {
    chunkArray[i % (valuesToFill.length - 1)].push(null as T);
  }

  // Fill each chunk with interpolated values using the specified interpolation function
  for (let i = 0; i < chunkArray.length - 1; i++) {
    const currentChunk = chunkArray[i];
    const nextChunk = chunkArray[i + 1];
    const currentValue = currentChunk[0];
    const nextValue = nextChunk[0];

    for (let j = 1; j < currentChunk.length; j++) {
      const percent = j / currentChunk.length;
      currentChunk[j] = fillFunction(percent, currentValue, nextValue);
    }
  }

  return chunkArray.flat();
};
