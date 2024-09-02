import {
  calculators,
  type Direction,
  type Duration,
  type Mode,
  type Bytes,
  type Cycles,
  type Instructions,
  type USD,
} from "@dfinity/icp-calculator";
import { type Amount } from "./cost";

const calcUSD = calculators().calculatorUSD;
const calcCycles = calculators().calculatorCycles;

export function canister(count: number): Amount {
  const usd = (calcUSD.canisterCreation() * count) as USD;
  const cycles = (calcCycles.canisterCreation() * count) as Cycles;
  return { usd, cycles };
}

export function execution(
  mode: Mode,
  instructions: Instructions,
  count: number,
): Amount {
  const usd = (calcUSD.execution(mode, instructions) * count) as USD;
  const cycles = (calcCycles.execution(mode, instructions) * count) as Cycles;
  return { usd, cycles };
}

export function storage(
  size: Bytes,
  duration: Duration,
  count: number,
): Amount {
  const usd = (calcUSD.storage(size, duration) * count) as USD;
  const cycles = (calcCycles.storage(size, duration) * count) as Cycles;
  return { usd, cycles };
}

export function message(
  mode: Mode,
  direction: Direction,
  bytes: Bytes,
  count: number,
): Amount {
  const usd = (calcUSD.message(mode, direction, bytes) * count) as USD;
  const cycles = (calcCycles.message(mode, direction, bytes) * count) as Cycles;
  return { usd, cycles };
}

export function httpOutcall(
  request: Bytes,
  response: Bytes,
  count: number,
): Amount {
  const usd = (calcUSD.httpOutcall(request, response) * count) as USD;
  const cycles = (calcCycles.httpOutcall(request, response) * count) as Cycles;
  return { usd, cycles };
}
