<script lang="ts">
  import { Kind } from "./ts/cost";
  import { round } from "./ts/round";

  interface PieChartData {
    label: string;
    kind: Kind;
    value: number;
    unit: string;
    color: string;
  }

  interface PieChartTotal {
    unit: string;
    days: number;
    oneTime: number;
    recurrent: number;
  }

  export let data: PieChartData[] = [];
  export let total: PieChartTotal = {
    unit: "$",
    days: 0,
    oneTime: 0,
    recurrent: 0,
  };

  function getKind(kind: Kind) {
    switch (kind) {
      case Kind.OneTime:
        return "1";
      case Kind.PerDay:
        return "";
    }
  }
</script>

<div class="piechart-legend">
  <ol>
    {#each data as { label, kind, value, color, unit }}
      <li style="--c: {color};">
        <span class="piechart-legend__label"
          >{label}<sup>{getKind(kind)}</sup></span
        >
        <strong class="piechart-legend__value">{unit}{round(value)}</strong>
      </li>
    {/each}

    {#if data.find((x) => x.label.includes(":Exe") || x.kind === Kind.OneTime)}
      <li>
        <span class="piechart-legend__label">
          <hr />
        </span>
      </li>
    {/if}
    {#if data.find((x) => x.kind == Kind.OneTime)}
      <li>
        <span class="piechart-legend__label t-discrete"
          >:<sup>{getKind(Kind.OneTime)}</sup> means one-time cost</span
        >
      </li>
    {/if}
    {#if data.find((x) => x.label.includes(":Exe"))}
      <li>
        <span class="piechart-legend__label t-discrete"
          >:Exe means Execution</span
        >
      </li>
      <li>
        <span class="piechart-legend__label t-discrete">:Net means Network</span
        >
      </li>
    {/if}
    <li>
      <span class="piechart-legend__label">
        <hr />
      </span>
    </li>
    <li>
      <strong class="piechart-legend__label">Total</strong>
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.oneTime + total.recurrent)}</strong
      >
    </li>
    <li>
      <span class="piechart-legend__label">- One-time</span>
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.oneTime)}</strong
      >
    </li>
    <li>
      <span class="piechart-legend__label">
        - Recurrent<sup>{getKind(Kind.PerDay)}</sup>
      </span>
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.recurrent)}</strong
      >
    </li>
  </ol>
</div>

<style>
  .piechart-legend ol {
    display: flex;
    flex-direction: column;
  }

  .piechart-legend__label {
    flex: 1;
  }

  .piechart-legend li {
    display: flex;
    align-items: center;
  }

  .piechart-legend li::before {
    content: "";
    display: inline-block;
    width: 1ex;
    height: 1ex;
    border-radius: 50%;
    background: var(--c);
    margin-right: 1ex;
  }
</style>
