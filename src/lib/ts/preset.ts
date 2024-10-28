import {
  Caller,
  Canister,
  Ingress,
  MemoryAllocation,
  Storage,
  Timer,
  type Feature,
} from "./feature";

export function landingPage(): Feature[] {
  return [new Canister(), new Storage()];
}

export function socialNetwork(users: number): Feature[] {
  const BYTES_PER_USER = 100_000_000;
  const INGRESS_PER_USER = 10;
  const INSTRUCTIONS_PER_INGRESS = 10_000_000;
  const INSTRUCTIONS_PER_TIMER = 10_000_000_000;

  const features = [];

  features.push(new Canister());

  const storage = new Storage();
  storage.storage_index = storage.storage_values.findIndex(
    (x) => x >= users * BYTES_PER_USER,
  );
  features.push(storage);

  const ingress = new Ingress();
  ingress.instruction_index = ingress.instruction_values.findIndex(
    (x) => x >= INSTRUCTIONS_PER_INGRESS,
  );
  ingress.count = users * INGRESS_PER_USER;
  features.push(ingress);

  const timer = new Timer();
  timer.instruction_index = timer.instruction_values.findIndex(
    (x) => x >= INSTRUCTIONS_PER_TIMER,
  );
  features.push(timer);

  return features;
}

export function decentralizedExchange(tradesPerDay: number): Feature[] {
  const INGRESS_PER_TRADE = 1;
  const CALLS_PER_TRADE = 2;
  const STORAGE_BYTES_PER_TRADE = 4096;
  const STORAGE_HISTORY_DAYS = 365;
  const INSTRUCTIONS_PER_TIMER = 10_000_000_000;

  const features = [];

  features.push(new Canister());

  const storage = new Storage();
  storage.storage_index = storage.storage_values.findIndex(
    (x) => x >= tradesPerDay * STORAGE_BYTES_PER_TRADE * STORAGE_HISTORY_DAYS,
  );
  features.push(storage);

  const ingress = new Ingress();
  ingress.count = tradesPerDay * INGRESS_PER_TRADE;
  features.push(ingress);

  const call = new Caller();
  call.count = tradesPerDay * CALLS_PER_TRADE;
  features.push(call);

  const timer = new Timer();
  timer.instruction_index = timer.instruction_values.findIndex(
    (x) => x >= INSTRUCTIONS_PER_TIMER,
  );
  features.push(timer);

  return features;
}

export function largeData(users: number): Feature[] {
  const INGRESS_PER_USER = 1;
  const USERS_PER_DAY = 100;
  const STORAGE_BYTES_PER_USER = 4 * 1000 * 1000; // 4MB
  const HUNDRED_GB = 100 * 1000 * 1000 * 1000;

  const features = [];

  const canisters = new Canister();
  canisters.count = 20;
  features.push(canisters);

  const storage = new Storage();
  storage.count = users * STORAGE_BYTES_PER_USER / HUNDRED_GB;
  storage.storage_index = storage.storage_values.findIndex(
    (x) => x >= HUNDRED_GB,
  );
  features.push(storage);

  const memory_allocation = new MemoryAllocation();
  memory_allocation.count = users * STORAGE_BYTES_PER_USER / HUNDRED_GB;
  memory_allocation.storage_index = memory_allocation.storage_values.findIndex(
    (x) => x >= HUNDRED_GB,
  );
  features.push(memory_allocation);

  const ingress = new Ingress();
  ingress.count = USERS_PER_DAY * INGRESS_PER_USER;
  features.push(ingress);

  return features;
}