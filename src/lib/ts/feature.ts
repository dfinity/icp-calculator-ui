import {
  type Bytes,
  Direction,
  Duration,
  type Instructions,
  Mode,
} from "@dfinity/icp-calculator";
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
import { Breakdown, Category, Cost, Kind } from "./cost";
import {
  bytesToString,
  countToString,
  instructionValues,
  networkValues,
  percentToString,
  percentValues,
  repeatToString,
  repeatValues,
  storageValues,
} from "./value";

export interface Field {
  label: string;
  type: "increment" | "range";
  values?: string[];
  default: number;
  onChange: (value: number) => void;
}

export interface Feature {
  fields: () => Field[];
  cost: () => Breakdown;
  info: () => string;
  label: () => string;
}

export class Canister implements Feature {
  count: number;

  constructor() {
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

  label(): string {
    return "Canister";
  }
}

export class Storage implements Feature {
  count: number;
  storage_index: number;
  storage_values: number[];

  constructor() {
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
      Canisters pay for the storage they consumed. This includes storage for
      the Wasm binary, the Wasm memory, the stable memory, and enqueued
      messages.
    `;
  }

  label(): string {
    return "Storage";
  }
}

export class MemoryAllocation implements Feature {
  count: number;
  storage_index: number;
  storage_values: number[];

  constructor() {
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
      Canisters can reserve some amount of storage ahead of time by setting
      memory-allocation in their canister settings.
    `;
  }

  label(): string {
    return "MemoryAllocation";
  }
}

export class ComputeAllocation implements Feature {
  count: number;
  percent_index: number;
  percent_values: number[];

  constructor() {
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
        label: "Capacity",
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
      Canisters can reserve a share of compute capacity by setting
      compute-allocation in their canister settings. Compute allocation is
      expressed in percents and denotes the percentage of an execution core.
    `;
  }

  label(): string {
    return "ComputeAllocation";
  }
}

export class Ingress implements Feature {
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
      Ingress messages are added to blocks and executed on all nodes of the subnet.
    `;
  }

  label(): string {
    return "Ingress";
  }
}

export class Query implements Feature {
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
      Queries are read-only messages that are executed by a single node and do
      not go through consensus. Currently canisters do not pay for queries.
    `;
  }

  label(): string {
    return "Query";
  }
}

export class Caller implements Feature {
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
      A canister can call another canister. This item computes call costs for
      the caller, which consist of the network costs to transfer bytes and the
      execution cost process the response.
    `;
  }

  label(): string {
    return "Caller";
  }
}

export class Callee implements Feature {
  count: number;

  instruction_index: number;
  instruction_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
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
      another canister. This cost depends only on executed instructions because
      the network costs are covered by the caller.
    `;
  }

  label(): string {
    return "Callee";
  }
}

export class Timer implements Feature {
  count: number;

  instruction_index: number;
  instruction_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
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

  label(): string {
    return "Timer";
  }
}

export class Heartbeat implements Feature {
  count: number;

  instruction_index: number;
  instruction_values: number[];

  constructor() {
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

  label(): string {
    return "Heartbeat";
  }
}

export class HttpOutcall implements Feature {
  count: number;

  request_index: number;
  request_values: number[];

  response_index: number;
  response_values: number[];

  repeat_index: number;
  repeat_values: number[];

  constructor() {
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

  label(): string {
    return "HttpOutcall";
  }
}

export class Ecdsa implements Feature {
  count: number;

  repeat_index: number;
  repeat_values: number[];

  constructor() {
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

  label(): string {
    return "Ecdsa";
  }
}

export class Schnorr implements Feature {
  count: number;

  repeat_index: number;
  repeat_values: number[];

  constructor() {
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

  label(): string {
    return "Schnorr";
  }
}

export const FEATURES: { label: string; build: () => Feature }[] = [
  {
    label: new Canister().label(),
    build: () => new Canister(),
  },
  {
    label: new Storage().label(),
    build: () => new Storage(),
  },
  {
    label: new Ingress().label(),
    build: () => new Ingress(),
  },
  {
    label: new Query().label(),
    build: () => new Query(),
  },
  {
    label: new Caller().label(),
    build: () => new Caller(),
  },
  {
    label: new Callee().label(),
    build: () => new Callee(),
  },
  {
    label: new Timer().label(),
    build: () => new Timer(),
  },
  {
    label: new Heartbeat().label(),
    build: () => new Heartbeat(),
  },
  {
    label: new MemoryAllocation().label(),
    build: () => new MemoryAllocation(),
  },
  {
    label: new ComputeAllocation().label(),
    build: () => new ComputeAllocation(),
  },
  {
    label: new Ecdsa().label(),
    build: () => new Ecdsa(),
  },
  {
    label: new Schnorr().label(),
    build: () => new Schnorr(),
  },
  {
    label: new HttpOutcall().label(),
    build: () => new HttpOutcall(),
  },
];
