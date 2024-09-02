<script lang="ts">
  import Number from "./Number.svelte";
  import { Kind } from "./utils/cost";
  import { round } from "./utils/round";

  type PieChartData = {
    label: string;
    kind: Kind;
    value: number;
    unit: string;
    color: string;
  };

  type PieChartTotal = {
    unit: string;
    days: number;
    oneTime: number;
    recurrent: number;
  };

  export let data: PieChartData[] = [];
  export let total: PieChartTotal = {
    unit: "$",
    days: 0,
    oneTime: 0,
    recurrent: 0,
  };

  function getUnit() {
    if (data && data.length) {
      return data[0].unit;
    }
    return "$";
  }

  function getKind(kind: Kind) {
    switch (kind) {
      case Kind.OneTime:
        return "";
      case Kind.PerDay:
        return "∞";
    }
  }
</script>

<div class="piechart-legend">
  <ol>
    {#each data as { label, kind, value, color, unit }, index}
      <li style="--c: {color};">
        <span class="piechart-legend__label"
          >{label}<sup>{getKind(kind)}</sup></span
        >
        <strong class="piechart-legend__value">{unit}{round(value)}</strong>
      </li>
    {/each}
    <li>
      <span class="piechart-legend__label">
        <hr />
      </span>
    </li>
    <li>
      <span class="piechart-legend__label"
        >One-time<sup>{getKind(Kind.OneTime)}</sup></span
      >
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.oneTime)}</strong
      >
    </li>
    <li>
      <span class="piechart-legend__label">
        Recurrent<sup>{getKind(Kind.PerDay)}</sup>
      </span>
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.recurrent)}</strong
      >
    </li>
    <li>
      <strong class="piechart-legend__label">Total</strong>
      <strong class="piechart-legend__value"
        >{total.unit}{round(total.oneTime + total.recurrent)}</strong
      >
    </li>
  </ol>
</div>

<style>
  .piechart-legend ol {
    display: flex;
    flex-direction: column;
    margin-left: 2ex;
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
