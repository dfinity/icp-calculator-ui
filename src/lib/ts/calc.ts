import {
  calculators,
  type Bytes,
  type Cycles,
  type Direction,
  type Duration,
  type HttpOutcallUsage,
  type Instructions,
  type Mode,
  type USD,
} from "@dfinity/icp-calculator";
import { type Amount } from "./cost";

const DEFAULT_SUBNET_SIZE = 13;

let calcUSD = calculators().calculatorUSD;
let calcCycles = calculators().calculatorCycles;
let currentSubnetSize = DEFAULT_SUBNET_SIZE;

const calcUSD28 = calculators({ subnetSize: 28 }).calculatorUSD;
const calcCycles28 = calculators({ subnetSize: 28 }).calculatorCycles;

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

export function memoryAllocation(
  size: Bytes,
  duration: Duration,
  count: number,
): Amount {
  const usd = (calcUSD.memoryAllocation(size, duration) * count) as USD;
  const cycles = (calcCycles.memoryAllocation(size, duration) *
    count) as Cycles;
  return { usd, cycles };
}

export function computeAllocation(
  percent: number,
  duration: Duration,
  count: number,
): Amount {
  const usd = (calcUSD.computeAllocation(percent, duration) * count) as USD;
  const cycles = (calcCycles.computeAllocation(percent, duration) *
    count) as Cycles;
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

export function httpOutcallV2(usage: HttpOutcallUsage, count: number): Amount {
  const usd = (calcUSD.httpOutcallV2(usage) * count) as USD;
  const cycles = (calcCycles.httpOutcallV2(usage) * count) as Cycles;
  return { usd, cycles };
}

export function signWithEcdsa(
  payload: Bytes,
  signature: Bytes,
  count: number,
): Amount {
  const usd = (calcUSD28.signWithEcdsa(payload, signature) * count) as USD;
  const cycles = (calcCycles28.signWithEcdsa(payload, signature) *
    count) as Cycles;
  return { usd, cycles };
}

export function signWithSchnorr(
  payload: Bytes,
  signature: Bytes,
  count: number,
): Amount {
  const usd = (calcUSD28.signWithSchnorr(payload, signature) * count) as USD;
  const cycles = (calcCycles28.signWithSchnorr(payload, signature) *
    count) as Cycles;
  return { usd, cycles };
}

export function updateSubnetSize(subnetSize: number) {
  calcUSD = calculators({ subnetSize }).calculatorUSD;
  calcCycles = calculators({ subnetSize }).calculatorCycles;
  currentSubnetSize = subnetSize;
}

// The number of nodes the calculators are currently configured for. An HTTP
// outcall cannot ask more nodes than that to perform it.
export function subnetSize(): number {
  return currentSubnetSize;
}
