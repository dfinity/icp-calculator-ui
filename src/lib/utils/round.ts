export function round(value: number): number {
  if (value < 1e-10) {
    return 0;
  }
  if (value < 0.01) {
    const lg10 = Math.floor(Math.log10(value));
    return Math.round(value * Math.pow(10, -lg10)) / Math.pow(10, -lg10);
  }
  if (value < 100) {
    return Math.round(value * 100) / 100;
  }
  return Math.round(value);
}
