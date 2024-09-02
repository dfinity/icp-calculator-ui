import {
  Call,
  Canister,
  Ingress,
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

  let features = [];

  features.push(new Canister());

  let storage = new Storage();
  storage.storage_index = storage.storage_values.findIndex(
    (x) => x >= users * BYTES_PER_USER,
  );
  features.push(storage);

  let ingress = new Ingress();
  ingress.instruction_index = ingress.instruction_values.findIndex(
    (x) => x >= INSTRUCTIONS_PER_INGRESS,
  );
  ingress.count = users * INGRESS_PER_USER;
  features.push(ingress);

  let timer = new Timer();
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

  let features = [];

  features.push(new Canister());

  let storage = new Storage();
  storage.storage_index = storage.storage_values.findIndex(
    (x) => x >= tradesPerDay * STORAGE_BYTES_PER_TRADE * STORAGE_HISTORY_DAYS,
  );
  features.push(storage);

  let ingress = new Ingress();
  ingress.count = tradesPerDay * INGRESS_PER_TRADE;
  features.push(ingress);

  let call = new Call();
  call.count = tradesPerDay * CALLS_PER_TRADE;
  features.push(call);

  let timer = new Timer();
  timer.instruction_index = timer.instruction_values.findIndex(
    (x) => x >= INSTRUCTIONS_PER_TIMER,
  );
  features.push(timer);

  return features;
}
