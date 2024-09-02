<script lang="ts">
  // utilities
  import { spreadArray } from "./lib/utils/spreadArray";

  // components
  import PieChart from "./lib/PieChart.svelte";
  import PieChartLegend from "./lib/PieChartLegend.svelte";
  import Card from "./lib/Card.svelte";
  import Number from "./lib/Number.svelte";

  // icons
  import PagesLine from "./lib/icons/pages-line.svg.svelte";
  import GroupLine from "./lib/icons/group-line.svg.svelte";
  import CoinsLine from "./lib/icons/coins-line.svg.svelte";
  import PencilLine from "./lib/icons/pencil-line.svg.svelte";
  import {
    Canister,
    Storage,
    features,
    type Feature,
  } from "./lib/utils/feature";
  import { Breakdown, Kind } from "./lib/utils/cost";
  import type { USD } from "@dfinity/icp-calculator";
  import {
    decentralizedExchange,
    landingPage,
    socialNetwork,
  } from "./lib/utils/preset";

  // types
  type PieChartData = {
    label: string;
    kind: Kind;
    value: USD;
    unit: "$";
    color: string;
  };

  // the design contains 3 colors
  const colorStops = [
    "var(--cr-data-1)",
    "var(--cr-data-2)",
    "var(--cr-data-3)",
  ];

  let vizData: PieChartData[] = [];
  let vizDays = 365;
  let total = {
    unit: "$",
    days: vizDays,
    oneTime: 0,
    recurrent: 0,
  };

  $: {
    let costs = userFeatures.map((feature) => feature.cost());
    let breakdown = new Breakdown();
    for (const x of costs) {
      breakdown.merge(x);
    }
    breakdown.sort();

    total.days = vizDays;
    total.oneTime = breakdown.total().oneTime.amount.usd;
    total.recurrent = breakdown.total().perDay.amount.usd * vizDays;

    vizData = breakdown.costs().map((x) => {
      return {
        label: x.label(),
        kind: x.kind,
        value: x.cost(vizDays).usd,
        unit: "$",
        color: "",
      };
    });

    // but we have X possible categories so lets interpolate the colors, since
    // CSS supports color mixing we don't need any color lib to do so
    const colorsForCategories = spreadArray(
      colorStops,
      vizData.length,
      (percent, currentValue, nextValue) =>
        `color-mix(in okLab, ${currentValue} ${(1 - percent) * 100}%, ${nextValue})`,
    );
    // update vizData here
    vizData.forEach((data, index) => {
      data.color = colorsForCategories[index];
    });
  }

  export let userFeatures: Feature[] = [];

  let newlyAdded = -1;

  function removeUserFeature(id: number) {
    newlyAdded = -1;
    userFeatures = userFeatures.filter((f) => f.id != id);
  }

  function addUserFeature(feature: Feature) {
    userFeatures.unshift(feature);
    newlyAdded = feature.id;
    userFeatures = userFeatures;
  }

  let presets = {
    landing: landingPage(),

    social: socialNetwork(1000),

    dex: decentralizedExchange(1000),

    custom: [] as Feature[],
  };

  let selectedPreset = "landing";

  togglePreset("landing");

  function togglePreset(label: "landing" | "social" | "dex" | "custom") {
    if (selectedPreset == "custom") {
      presets.custom = [...userFeatures];
    }
    userFeatures = [...presets[label]];
    selectedPreset = label;
    newlyAdded = -1;
  }

  let cartVisible = false;

  function toggleCart() {
    cartVisible = !cartVisible;
  }

</script>

<main>
  <h1>ICP Pricing Calculator<sup>β</sup></h1>

  <aside class="l-stack">
    <form class="l-stack">
      <ul class="l-horizontal">
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <PagesLine />
            </span>
            <input
              type="radio"
              name="preset"
              value="1"
              checked={selectedPreset == "landing"}
              on:change={() => togglePreset("landing")}
            />
            <strong class="h2">Landing Page</strong>
            <span class="t-discrete">&nbsp;</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <GroupLine />
            </span>
            <input
              type="radio"
              name="preset"
              value="2"
              checked={selectedPreset == "social"}
              on:change={() => togglePreset("social")}
            />
            <strong class="h2">Social network</strong>
            <span class="t-discrete">1000 active users</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <CoinsLine />
            </span>
            <input
              type="radio"
              name="preset"
              value="3"
              checked={selectedPreset == "dex"}
              on:change={() => togglePreset("dex")}
            />
            <strong class="h2">DEX</strong>
            <span class="t-discrete">1000 trades per day</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <PencilLine />
            </span>
            <input
              type="radio"
              name="preset"
              value="4"
              checked={selectedPreset == "custom"}
              on:change={() => togglePreset("custom")}
            />
            <strong class="h2">Custom</strong>
            <span class="t-discrete">&nbsp;</span>
          </Card>
        </li>
      </ul>
    </form>
  </aside>

  <main class="l-horizontal l-stack l-stack--large">
    <!-- left sidebar -->
    <div class="l-1/2 l-1/1@mobile">
      <Card tag="section"  class="cart {cartVisible ? 'cart--visible' : 'cart--hidden'}">
        <div class="cart__summary">
        <div class="l-horizontal l-horizontal--center">
          <strong class="l-grow">Days</strong>
          <div class="l-1/2 l-shrink">
            <Number
              type="increment"
              value={vizDays}
              onChange={(value) => (vizDays = value)}
            />
          </div>
        </div>
        <hr class="l-stack l-stack--large" />
        <div class="cart__summary">
          <div class="l-horizontal l-stack l-stack--large">
            {#if vizData.length > 0}
              <div class="l-grow">
                <PieChart data={vizData} />
              </div>
              <div class="l-2/3">
                <PieChartLegend data={vizData} {total} />
              </div>
            {:else}
              <div class="l-grow">
                Nothing to calculate. Start by adding features. 
              </div>
            {/if}
          </div>
        </div>
        <button class="button button--primary button--full l-stack  l-stack--large" on:click={toggleCart}>Add a feature</button>
        </div>
        <aside class="cart__items">
        <div class="toolbar">
          {#each features as feature}
            <button
              class="button button--primary l-1/2 l-stack"
              aria-label="add to cart"
              on:click={() => {addUserFeature(feature.build()); toggleCart()}}
              >+{feature.label}</button
            >
          {/each}
        </div>
        </aside>
      </Card>
    </div>

    <!-- right cart content -->
    <section class="l-1/2 l-1/1@mobile" aria-label="Cart Contents">
      <div class="feature-container l-vertical l-horizontal--center">
        <h1 class="t-discrete">Configure added features: </h1>
        {#each userFeatures as feature (feature.id)}
          <Card class="card" tag="aside" aria-label={`feature-${feature.id}`} highlight={feature.id == newlyAdded}>
            {#each feature.fields() as f, i}
              <div class="l-horizontal {i > 0 ? "l-stack" : ""}">
                {#if i == 0}
                  <strong class="l-grow">{f.label}</strong>
                {:else}
                  <span class="l-grow">{f.label}</span>
                {/if}
                <div class="l-1/2 l-shrink">
                  <Number
                    type={f.type}
                    list={f.values}
                    onChange={(value) => {
                      f.onChange(value);
                      vizData = [];
                    }}
                    value={f.default}
                  />
                </div>
              </div>
            {/each}
            <button
              class="button button--text button--danger button--left"
              on:click={() => removeUserFeature(feature.id)}
              >Remove
            </button>
          </Card>
        {/each}
      </div>
    </section>
  </main>
</main>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1ex;
  }

  .cart__summary {
    display: block;
  }

  .feature-container {
    padding: 2ex;
    border: solid 1px;
    border-color: var(--cr-card-border);
    border-radius: var(--sr-card-radius);
  }

  :global(.cart--hidden) .cart__items {
    display: none;
  }

  :global(.cart--hidden) .cart__summary {
    display: block;
  }

  :global(.cart--visible) .cart__items {
    display: block;
  }

  :global(.cart--visible) .cart__summary {
    display: none;
  }

</style>
