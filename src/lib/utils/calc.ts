import {
  calculators,
  Direction,
  Duration,
  Mode,
  type Bytes,
  type Cycles,
  type Instructions,
  type USD,
} from "@dfinity/icp-calculator";
import { Amount } from "./cost";

let calcUSD = calculators().calculatorUSD;
let calcCycles = calculators().calculatorCycles;

export function canister(count: number): Amount {
  let usd = (calcUSD.canisterCreation() * count) as USD;
  let cycles = (calcCycles.canisterCreation() * count) as Cycles;
  return { usd, cycles };
}

export function execution(
  mode: Mode,
  instructions: Instructions,
  count: number,
): Amount {
  let usd = (calcUSD.execution(mode, instructions) * count) as USD;
  let cycles = (calcCycles.execution(mode, instructions) * count) as Cycles;
  return { usd, cycles };
}

export function storage(
  size: Bytes,
  duration: Duration,
  count: number,
): Amount {
  let usd = (calcUSD.storage(size, duration) * count) as USD;
  let cycles = (calcCycles.storage(size, duration) * count) as Cycles;
  return { usd, cycles };
}

export function message(
  mode: Mode,
  direction: Direction,
  bytes: Bytes,
  count: number,
): Amount {
  let usd = (calcUSD.message(mode, direction, bytes) * count) as USD;
  let cycles = (calcCycles.message(mode, direction, bytes) * count) as Cycles;
  return { usd, cycles };
}

export function httpOutcall(
  request: Bytes,
  response: Bytes,
  count: number,
): Amount {
  let usd = (calcUSD.httpOutcall(request, response) * count) as USD;
  let cycles = (calcCycles.httpOutcall(request, response) * count) as Cycles;
  return { usd, cycles };
}
