import type { USD, Cycles } from "@dfinity/icp-calculator";

export enum Kind {
  OneTime,
  PerDay,
}

export enum Category {
  Canister,
  ExecutionCall,
  ExecutionHeartbeat,
  ExecutionIngress,
  ExecutionTimer,
  NetworkCall,
  NetworkIngress,
  Storage,
  HttpOutcall,
  Total,
}

export class Amount {
  usd: USD;
  cycles: Cycles;

  constructor(usd: USD, cycles: Cycles) {
    this.usd = usd;
    this.cycles = cycles;
  }

  public static zero(): Amount {
    return new Amount(0 as USD, 0 as Cycles);
  }
}

export class Cost {
  kind: Kind;
  category: Category;
  amount: Amount;

  constructor(kind: Kind, category: Category, amount: Amount) {
    this.kind = kind;
    this.category = category;
    this.amount = amount;
  }

  public addIfSameKind(other: Cost): boolean {
    if (this.kind === other.kind) {
      this.amount.usd = (this.amount.usd + other.amount.usd) as USD;
      this.amount.cycles = (this.amount.cycles + other.amount.cycles) as Cycles;
      return true;
    }
    return false;
  }

  public addIfSameCategoryAndKind(other: Cost): boolean {
    if (this.category === other.category) {
      return this.addIfSameKind(other);
    }
    return false;
  }

  public label(): string {
    switch (this.category) {
      case Category.Canister:
        return "Canister";
      case Category.ExecutionCall:
        return "Execution:Call";
      case Category.ExecutionHeartbeat:
        return "Execution:Heartbeat";
      case Category.ExecutionIngress:
        return "Execution:Ingress";
      case Category.ExecutionTimer:
        return "Execution:Timer";
      case Category.Storage:
        return "Storage";
      case Category.NetworkCall:
        return "Network:Call";
      case Category.NetworkIngress:
        return "Network:Ingress";
      case Category.HttpOutcall:
        return "HttpOutcall";
    }
    return "";
  }

  public cost(days: number): Amount {
    switch (this.kind) {
      case Kind.OneTime:
        return this.amount;
      case Kind.PerDay: {
        return {
          usd: (this.amount.usd * days) as USD,
          cycles: (this.amount.cycles * days) as Cycles,
        };
      }
    }
  }
}

interface TotalCost {
  oneTime: Cost;
  perDay: Cost;
}

export class Breakdown {
  items: Cost[];

  public constructor() {
    this.items = [];
  }

  public add(cost: Cost): void {
    for (const item of this.items) {
      if (item.addIfSameCategoryAndKind(cost)) {
        return;
      }
    }
    this.items.push(cost);
  }

  public merge(other: Breakdown): void {
    for (const item of other.items) {
      this.add(item);
    }
  }

  public sort(): void {
    this.items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.valueOf() - b.category.valueOf();
      }
      return a.kind.valueOf() - b.kind.valueOf();
    });
  }

  public costs(): Cost[] {
    return this.items;
  }

  public total(): TotalCost {
    const oneTime = new Cost(Kind.OneTime, Category.Total, Amount.zero());
    for (const item of this.items) {
      oneTime.addIfSameKind(item);
    }

    const perDay = new Cost(Kind.PerDay, Category.Total, Amount.zero());
    for (const item of this.items) {
      perDay.addIfSameKind(item);
    }

    return { oneTime, perDay };
  }
}
