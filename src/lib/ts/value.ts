const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

const K = 1000;
const M = 1000 * K;
const B = 1000 * M;

export function storageValues(): number[] {
  return [100 * KB, 1 * MB, 10 * MB, 100 * MB, 1 * GB, 10 * GB, 100 * GB];
}

export function instructionValues(): number[] {
  return [0, 100 * K, 500 * K, 1 * M, 10 * M, 100 * M, 1 * B, 10 * B, 100 * B];
}

export function networkValues(): number[] {
  return [0, 256, 512, 1 * KB, 10 * KB, 100 * KB, 1 * MB, 2 * MB];
}

export function percentValues(): number[] {
  return [0, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
}

export function bytesToString(bytes: number): string {
  if (bytes >= GB) {
    return `${bytes / GB} GB`;
  }
  if (bytes >= MB) {
    return `${bytes / MB} MB`;
  }
  if (bytes >= KB) {
    return `${bytes / KB} KB`;
  }
  return `${bytes}`;
}

export function countToString(value: number): string {
  if (value >= B) {
    return `${value / B} B`;
  }
  if (value >= M) {
    return `${value / M} M`;
  }
  if (value >= K) {
    return `${value / K} K`;
  }
  return `${value}`;
}

export function percentToString(percent: number): string {
  return `${percent}%`;
}

const REPEAT: Array<[number, string]> = [
  [0, "Once"],
  [1 / 30, "Every month"],
  [1 / 7, "Every week"],
  [1, "Every day"],
  [24, "Every hour"],
  [24 * 60, "Every minute"],
];

export function repeatValues(): number[] {
  return REPEAT.map((x) => x[0]);
}

export function repeatToString(value: number): string {
  const elem = REPEAT.find((x) => x[0] === value) ?? [0, "Once"];
  return elem[1];
}
