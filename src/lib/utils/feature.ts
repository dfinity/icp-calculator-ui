import {
  type Bytes,
  Duration,
  type Instructions,
  Mode,
  Direction,
} from "@dfinity/icp-calculator";
import { Breakdown, Category, Cost, Kind } from "./cost";
import { canister, execution, httpOutcall, message, storage } from "./calc";

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
}

export const features = [
  {
    label: "Canister",
    info: "",
    build: () => new Canister(),
  },
  {
    label: "Storage",
    info: "",
    build: () => new Storage(),
  },
  {
    label: "Ingress",
    info: "",
    build: () => new Ingress(),
  },
  {
    label: "Call",
    info: "",
    build: () => new Call(),
  },
  {
    label: "Timer",
    info: "",
    build: () => new Timer(),
  },
  {
    label: "Heartbeat",
    info: "",
    build: () => new Heartbeat(),
  },
  {
    label: "HttpOutcall",
    info: "",
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
    this.repeat_index = 4;
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
}

export class Call implements Feature {
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
    this.repeat_index = 4;
    this.repeat_values = repeatValues();
  }

  fields(): Field[] {
    return [
      {
        label: "Call",
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
        Category.CallExecution,
        execution(Mode.Replicated, instructions, count),
      ),
    );
    result.add(
      new Cost(
        kind,
        Category.CallNetwork,
        message(Mode.Replicated, Direction.CanisterToCanister, network, count),
      ),
    );
    return result;
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
    this.repeat_index = 5;
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
    this.repeat_index = 4;
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

const REPEAT: Array<[number, string]> = [
  [0, "Never"],
  [1 / 28, "Every 4 weeks"],
  [1 / 14, "Every 2 weeks"],
  [1 / 7, "Every week"],
  [1, "Every day"],
  [24, "Every hour"],
  [24 * 60, "Every minute"],
];

function repeatValues(): number[] {
  return REPEAT.map((x) => x[0]);
}

function repeatToString(value: number): string {
  const elem = REPEAT.find((x) => x[0] === value) ?? [0, "Never"];
  return elem[1];
}
