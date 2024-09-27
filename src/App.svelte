<script lang="ts">
  import type { USD } from "@dfinity/icp-calculator";
  import Card from "./lib/Card.svelte";
  import Number from "./lib/Number.svelte";
  import PieChart from "./lib/PieChart.svelte";
  import PieChartLegend from "./lib/PieChartLegend.svelte";
  import CoinsLine from "./lib/icons/coins-line.svg.svelte";
  import GroupLine from "./lib/icons/group-line.svg.svelte";
  import PagesLine from "./lib/icons/pages-line.svg.svelte";
  import { updateSubnetSize } from "./lib/ts/calc";
  import { Breakdown, Kind } from "./lib/ts/cost";
  import { FEATURES, type Feature } from "./lib/ts/feature";
  import { fromJSON, toJSON } from "./lib/ts/json";
  import {
    decentralizedExchange,
    landingPage,
    socialNetwork,
  } from "./lib/ts/preset";
  import { spreadArray } from "./lib/ts/spreadArray";

  interface PieChartData {
    label: string;
    kind: Kind;
    value: USD;
    unit: "$";
    color: string;
  }

  // the design contains 3 colors
  const colorStops = [
    "var(--cr-data-1)",
    "var(--cr-data-2)",
    "var(--cr-data-3)",
  ];

  let vizData: PieChartData[] = [];
  let vizDays = 365;
  let subnetValues = [13, 28, 31, 34, 40];
  let subnetIndex = 0;
  let total = {
    unit: "$",
    days: vizDays,
    oneTime: 0,
    recurrent: 0,
  };

  let jsonURL = "#/";

  $: {
    updateSubnetSize(subnetValues[subnetIndex]);
    let costs = userFeatures.map((feature) => feature.cost());
    let breakdown = new Breakdown();
    for (const x of costs) {
      breakdown.merge(x);
    }
    breakdown.sort();

    total.days = vizDays;
    total.oneTime = breakdown.total().oneTime.amount.usd;
    total.recurrent = breakdown.total().perDay.amount.usd * vizDays;

    vizData = breakdown.costs().map((x) => ({
      label: x.label(),
      kind: x.kind,
      value: x.cost(vizDays).usd,
      unit: "$",
      color: "",
    }));

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

    if (typeof jsonURL != "string") {
      URL.revokeObjectURL(jsonURL);
    }

    const config = {
      days: vizDays,
      subnetIndex,
      subnetValues,
      features: userFeatures,
    };

    jsonURL = URL.createObjectURL(
      new Blob([toJSON(config)], { type: "text/plain" }),
    );
  }

  export let userFeatures: Feature[] = [];
  export let explained: Feature[] = [];

  let newlyAdded: Feature | null = null;

  function removeUserFeature(feature: Feature) {
    newlyAdded = null;
    userFeatures = userFeatures.filter((f) => f != feature);
  }

  function addUserFeature(feature: Feature) {
    userFeatures.unshift(feature);
    newlyAdded = feature;
    userFeatures = userFeatures;
  }

  let presets = {
    landing: landingPage(),

    social: socialNetwork(1000),

    dex: decentralizedExchange(1000),

    custom: [] as Feature[],
  };

  let selectedPreset = "landing";

  let presetVisible = false;

  loadPreset("landing");

  function loadPreset(label: "landing" | "social" | "dex" | "custom") {
    if (selectedPreset == "custom") {
      presets.custom = [...userFeatures];
    }
    userFeatures = [...presets[label]];
    selectedPreset = label;
    newlyAdded = null;
    presetVisible = false;
  }

  let cartVisible = false;

  function toggleCart() {
    cartVisible = !cartVisible;
  }

  function togglePreset() {
    presetVisible = !presetVisible;
  }

  function load(e: Event) {
    const element = e.target as HTMLInputElement;
    if (!element.files) {
      return;
    }
    const file = element.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (typeof contents === "string") {
        try {
          const config = fromJSON(contents);
          userFeatures = config.features;
          vizDays = config.days;
          subnetIndex = config.subnetIndex;
          subnetValues = config.subnetValues;
        } catch (err) {
          alert(`Failed to load: ${err}`);
        }
      }
    };
    reader.readAsText(file);
  }
</script>

<main>
  <h1>ICP Pricing Calculator<sup>β</sup></h1>

  <aside class="l-stack">
    <a href="#/" on:click={togglePreset}> Load preset </a> |
    <a href="#/">
      <label for="load-file"> Load file </label>
      <input type="file" id="load-file" on:change={load} accept=".json" />
    </a>
    |
    <a href={jsonURL} download="icp-features.json"> Save file </a>

    {#if presetVisible}
      <div class="l-1/2 l-1/1@mobile dropdown l-vertical">
        <button
          class="dropdown-item dropdown-item-first l-horizontal"
          on:click={() => loadPreset("landing")}
        >
          <span class="icon">
            <PagesLine />
          </span>&nbsp;Landing Page
        </button>
        <button
          class="dropdown-item l-horizontal"
          on:click={() => loadPreset("social")}
        >
          <span class="icon">
            <GroupLine />
          </span>&nbsp;Social network with 1K active users
        </button>
        <button
          class="dropdown-item dropdown-item-last l-horizontal"
          on:click={() => loadPreset("dex")}
        >
          <span class="icon">
            <CoinsLine />
          </span>&nbsp;DEX with 1K trades per day
        </button>
      </div>
    {/if}
  </aside>

  <main class="l-horizontal l-stack l-stack--large">
    <!-- left sidebar -->
    <div class="l-1/2 l-1/1@mobile">
      <Card
        tag="section"
        class="cart {cartVisible ? 'cart--visible' : 'cart--hidden'}"
      >
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
          <div class="l-horizontal l-horizontal--center l-stack">
            <strong class="l-grow">Subnet</strong>
            <div class="l-1/2 l-shrink">
              <Number
                type="range"
                list={subnetValues.map((x) => `${x} nodes`)}
                value={subnetIndex}
                onChange={(value) => (subnetIndex = value)}
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
          <button
            class="button button--primary button--full l-stack l-stack--large"
            on:click={toggleCart}>Add a feature</button
          >
        </div>
        <aside class="cart__items">
          <div class="toolbar">
            {#each FEATURES as feature}
              <button
                class="button button--primary l-1/2 l-stack"
                aria-label="add to cart"
                on:click={() => {
                  addUserFeature(feature.build());
                  toggleCart();
                }}>{feature.label}</button
              >
            {/each}
            <button
              class="button l-1/2 l-stack"
              aria-label="cancel"
              on:click={() => toggleCart()}>Cancel</button
            >
          </div>
        </aside>
      </Card>
    </div>

    <!-- right cart content -->
    <section class="l-1/2 l-1/1@mobile" aria-label="Cart Contents">
      <div class="feature-container l-vertical l-horizontal--center">
        <h1 class="t-discrete">Configure added features:</h1>
        {#each userFeatures as feature (feature)}
          <Card
            class="card"
            tag="aside"
            aria-label={`feature-${feature}`}
            highlight={feature == newlyAdded}
          >
            {#each feature.fields() as f, i}
              <div class="l-horizontal {i > 0 ? 'l-stack' : ''}">
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
            <div class="l-horizontal l-stack">
              {#if explained.indexOf(feature) != -1}
                <div class="t-discrete l-3/4">
                  {feature.info()}
                  <button
                    class="button button--text button--danger button--left"
                    on:click={() => {
                      explained = explained.filter((x) => x !== feature);
                    }}
                  >
                    ««
                  </button>
                </div>
              {:else}
                &nbsp;
                <button
                  class="button button--text button--danger button--left"
                  on:click={() => {
                    explained.push(feature);
                    explained = explained;
                  }}
                >
                  ⓘ
                </button>
              {/if}
              <button
                class="button button--text button--danger button--right"
                on:click={() => removeUserFeature(feature)}
                >Remove
              </button>
            </div>
          </Card>
        {/each}
      </div>
    </section>
    <hr class="l-1/1 l-stack l-stack--large" />
    <section class="l-1/1 links-container" aria-label="Links">
      <a
        href="https://internetcomputer.org/docs/current/developer-docs/gas-cost"
        class="t-center"
      >
        <img src="/icp.svg" alt="docs" height="20" />
      </a>
      <a href="https://github.com/dfinity/icp-calculator-ui" class="t-center">
        <img src="/github-mark.svg" alt="source code" height="20" />
      </a>
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

  .links-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  input[type="file"] {
    display: none;
    cursor: pointer;
  }

  a label {
    cursor: pointer;
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
