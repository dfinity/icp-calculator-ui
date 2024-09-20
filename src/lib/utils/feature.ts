import {
  type Bytes,
  Duration,
  type Instructions,
  Mode,
  Direction,
} from "@dfinity/icp-calculator";
import { Breakdown, Category, Cost, Kind } from "./cost";
import {
  canister,
  computeAllocation,
  execution,
  httpOutcall,
  memoryAllocation,
  message,
  signWithEcdsa,
  signWithSchnorr,
  storage,
} from "./calc";

const KB: number = 1024;
const MB: number = 1024 * KB;
const GB: number = 1024 * MB;

const K: number = 1000;
const M: number = 1000 * K;
const B: number = 1000 * M;

let nextId: number = 0;

export interface Field {
  label: string;
  type: "increment" | "range";
  values?: string[];
  default: number;
  onChange: (value: number) => void;
}

export interface Feature {
  id: number;
  fields: () => Field[];
  cost: () => Breakdown;
  info: () => string;
}

export const features = [
  {
    label: "Canister",
    build: () => new Canister(),
  },
  {
    label: "Storage",
    build: () => new Storage(),
  },
  {
    label: "Ingress",
    build: () => new Ingress(),
  },
  {
    label: "Query",
    build: () => new Query(),
  },
  {
    label: "Caller",
    build: () => new Caller(),
  },
  {
    label: "Callee",
    build: () => new Callee(),
  },
  {
    label: "Timer",
    build: () => new Timer(),
  },
  {
    label: "Heartbeat",
    build: () => new Heartbeat(),
  },
  {
    label: "MemoryAllocation",
    build: () => new MemoryAllocation(),
  },
  {
    label: "ComputeAllocation",
    build: () => new ComputeAllocation(),
  },
  {
    label: "Ecdsa",
    build: () => new Ecdsa(),
  },
  {
    label: "Schnorr",
    build: () => new Schnorr(),
  },
  {
    label: "HttpOutcall",
    build: () => new HttpOutcall(),
  },
];

export class Canister implements Feature {
  id: number;
  count: number;

  constructor() {
    this.id = nextId++;
    this.count = 1;
  }

  fields(): Field[] {
    return [
      {
        label: "Canister",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    result.add(new Cost(Kind.OneTime, Category.Canister, canister(this.count)));
    return result;
  }

  info(): string {
    return `
      A canister is a smart contract with its own code and state.
      There is a one-time fee for creating a canister.
    `;
  }
}

export class Storage implements Feature {
  id: number;
  count: number;
  storage_index: number;
  storage_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.storage_index = 2;
    this.storage_values = storageValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Storage",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Size",
        type: "range",
        values: this.storage_values.map(bytesToString),
        default: this.storage_index,
        onChange: (value) => (this.storage_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const bytes = this.storage_values[this.storage_index] as Bytes;
    result.add(
      new Cost(
        Kind.PerDay,
        Category.Storage,
        storage(bytes, Duration.fromDays(1), this.count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canisters pay for storage consumed by their Wasm memory, Wasm binary,
      stable memory, and enqueued messages. The payment is recurrent.
    `;
  }
}

export class MemoryAllocation implements Feature {
  id: number;
  count: number;
  storage_index: number;
  storage_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.storage_index = 2;
    this.storage_values = storageValues();
  }

  fields(): Field[] {
    return [
      {
        label: "MemoryAllocation",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Size",
        type: "range",
        values: this.storage_values.map(bytesToString),
        default: this.storage_index,
        onChange: (value) => (this.storage_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const bytes = this.storage_values[this.storage_index] as Bytes;
    result.add(
      new Cost(
        Kind.PerDay,
        Category.Storage,
        memoryAllocation(bytes, Duration.fromDays(1), this.count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canister can reserve some amount of storage ahead of time by setting
      memory-allocation in their canister settings.
    `;
  }
}

export class ComputeAllocation implements Feature {
  id: number;
  count: number;
  percent_index: number;
  percent_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.percent_index = 2;
    this.percent_values = percentValues();
  }

  fields(): Field[] {
    return [
      {
        label: "ComputeAllocation",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Size",
        type: "range",
        values: this.percent_values.map(percentToString),
        default: this.percent_index,
        onChange: (value) => (this.percent_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const percent = this.percent_values[this.percent_index];
    result.add(
      new Cost(
        Kind.PerDay,
        Category.Compute,
        computeAllocation(percent, Duration.fromDays(1), this.count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canister can reserve a share of compute capacity by setting
      compute-allocation in their canister settings.
      Compute allocation is expressed in percents and denotes the percentage of
      an execution core reserved for the canister.
    `;
  }
}

export class Ingress implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  request_index: number;
  request_values: number[];

  response_index: number;
  response_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 100;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
    this.request_index = 4;
    this.request_values = networkValues();
    this.response_index = 4;
    this.response_values = networkValues();
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Ingress",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
      {
        label: "Request bytes",
        type: "range",
        values: this.request_values.map(bytesToString),
        default: this.request_index,
        onChange: (value) => (this.request_index = value),
      },
      {
        label: "Response bytes",
        type: "range",
        values: this.response_values.map(bytesToString),
        default: this.response_index,
        onChange: (value) => (this.response_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const network = (this.request_values[this.request_index] +
      this.response_values[this.response_index]) as Bytes;
    const repeat = this.repeat_values[this.repeat_index];
    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.IngressExecution,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    result.add(
      new Cost(
        kind,
        Category.IngressNetwork,
        message(Mode.Replicated, Direction.UserToCanister, network, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Messages that users send to canisters are called ingress messages.
      Ingress messages are executed on all nodes. The cost depends on the number
      of executed instructions and on bytes transferred over the network.
    `;
  }
}

export class Query implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  request_index: number;
  request_values: number[];

  response_index: number;
  response_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 100;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
    this.request_index = 4;
    this.request_values = networkValues();
    this.response_index = 4;
    this.response_values = networkValues();
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Query",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
      {
        label: "Request bytes",
        type: "range",
        values: this.request_values.map(bytesToString),
        default: this.request_index,
        onChange: (value) => (this.request_index = value),
      },
      {
        label: "Response bytes",
        type: "range",
        values: this.response_values.map(bytesToString),
        default: this.response_index,
        onChange: (value) => (this.response_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const network = (this.request_values[this.request_index] +
      this.response_values[this.response_index]) as Bytes;
    const repeat = this.repeat_values[this.repeat_index];
    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.QueryExecution,
        execution(Mode.NonReplicated, instructions, count),
      ),
    );
    result.add(
      new Cost(
        kind,
        Category.QueryNetwork,
        message(Mode.NonReplicated, Direction.UserToCanister, network, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Queries are read-only messages that are executed by a single node.
      Currently canisters do not pay for queries.
    `;
  }
}

export class Caller implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  request_index: number;
  request_values: number[];

  response_index: number;
  response_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 100;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
    this.request_index = 4;
    this.request_values = networkValues();
    this.response_index = 4;
    this.response_values = networkValues();
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Caller",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
      {
        label: "Request bytes",
        type: "range",
        values: this.request_values.map(bytesToString),
        default: this.request_index,
        onChange: (value) => (this.request_index = value),
      },
      {
        label: "Response bytes",
        type: "range",
        values: this.response_values.map(bytesToString),
        default: this.response_index,
        onChange: (value) => (this.response_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const network = (this.request_values[this.request_index] +
      this.response_values[this.response_index]) as Bytes;
    const repeat = this.repeat_values[this.repeat_index];
    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.CallerExecution,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    result.add(
      new Cost(
        kind,
        Category.CallerNetwork,
        message(Mode.Replicated, Direction.CanisterToCanister, network, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      A canister can call another canister. This item computes costs of the caller,
      which consist of the network costs to transfer bytes and the execution
      cost to run the response callback.
    `;
  }
}

export class Callee implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 100;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Callee",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const repeat = this.repeat_values[this.repeat_index];
    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.CalleeExecution,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      This item computes the costs for a canister that is being called by
      another canister.  This cost depends only on executed instructions because
      the network costs are covered by the caller.
    `;
  }
}

export class Timer implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
    this.repeat_index = 4;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Timer",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const repeat = this.repeat_values[this.repeat_index];
    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.Timer,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canisters can schedule periodic or one-off work using timers. The cost of
      one timer execution depends on the number of executed instructions.
    `;
  }
}

export class Heartbeat implements Feature {
  id: number;
  count: number;

  instruction_index: number;
  instruction_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.instruction_index = 3;
    this.instruction_values = instructionValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Heartbeat",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Instructions",
        type: "range",
        values: this.instruction_values.map(countToString),
        default: this.instruction_index,
        onChange: (value) => (this.instruction_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const instructions = this.instruction_values[
      this.instruction_index
    ] as Instructions;
    const count = 24 * 3600;
    result.add(
      new Cost(
        Kind.PerDay,
        Category.Heartbeat,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      A hearbeat is equivalent to a periodic timer that executes as often as
      possible (once per block on idle subnets). Since heartbeats have no way
      of controlling their frequency, it is recommended to use timers instead.
    `;
  }
}

export class HttpOutcall implements Feature {
  id: number;
  count: number;

  request_index: number;
  request_values: number[];

  response_index: number;
  response_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.request_index = 4;
    this.request_values = networkValues();
    this.response_index = 4;
    this.response_values = networkValues();
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "HttpOutcall",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
      {
        label: "Request bytes",
        type: "range",
        values: this.request_values.map(bytesToString),
        default: this.request_index,
        onChange: (value) => (this.request_index = value),
      },
      {
        label: "Response bytes",
        type: "range",
        values: this.response_values.map(bytesToString),
        default: this.response_index,
        onChange: (value) => (this.response_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const request = this.request_values[this.request_index] as Bytes;
    const response = this.response_values[this.response_index] as Bytes;
    const repeat = this.repeat_values[this.repeat_index];

    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.HttpOutcall,
        httpOutcall(request, response, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canisters can make HTTP requests to Web 2.0 servers using HTTP outcalls.
    `;
  }
}

export class Ecdsa implements Feature {
  id: number;
  count: number;

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Ecdsa",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const repeat = this.repeat_values[this.repeat_index];

    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.Ecdsa,
        signWithEcdsa(32 as Bytes, 32 as Bytes, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canisters can request threshold ECDSA signatures to sign messages and
      transactions for other blockchains.
    `;
  }
}

export class Schnorr implements Feature {
  id: number;
  count: number;

  repeat_index: number;
  repeat_values: number[];

  constructor() {
    this.id = nextId++;
    this.count = 1;
    this.repeat_index = 3;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Schnorr",
        type: "increment",
        default: this.count,
        onChange: (value) => (this.count = value),
      },
      {
        label: "Frequency",
        type: "range",
        values: this.repeat_values.map(repeatToString),
        default: this.repeat_index,
        onChange: (value) => (this.repeat_index = value),
      },
    ];
  }

  cost(): Breakdown {
    const result = new Breakdown();
    const repeat = this.repeat_values[this.repeat_index];

    const count = repeat === 0 ? this.count : this.count * repeat;
    const kind = repeat === 0 ? Kind.OneTime : Kind.PerDay;
    result.add(
      new Cost(
        kind,
        Category.Schnorr,
        signWithSchnorr(32 as Bytes, 32 as Bytes, count),
      ),
    );
    return result;
  }

  info(): string {
    return `
      Canisters can request threshold Schnorr signatures to sign messages and
      transactions for other blockchains.
    `;
  }
}

function storageValues(): number[] {
  return [100 * KB, 1 * MB, 10 * MB, 100 * MB, 1 * GB, 10 * GB, 100 * GB];
}

function instructionValues(): number[] {
  return [0, 100 * K, 500 * K, 1 * M, 10 * M, 100 * M, 1 * B, 10 * B, 100 * B];
}

function networkValues(): number[] {
  return [0, 256, 512, 1 * KB, 10 * KB, 100 * KB, 1 * MB, 2 * MB];
}

function percentValues(): number[] {
  return [0, 1, 10, 20, 30, 50, 80, 100];
}

function bytesToString(bytes: number): string {
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

function countToString(value: number): string {
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

function percentToString(percent: number): string {
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

function repeatValues(): number[] {
  return REPEAT.map((x) => x[0]);
}

function repeatToString(value: number): string {
  const elem = REPEAT.find((x) => x[0] === value) ?? [0, "Once"];
  return elem[1];
}
