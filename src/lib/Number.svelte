<script lang="ts">
  export let count: number = 0;
  export let type: 'increment'|'range' = 'increment';
  export let min: number = 0;
  export let max: number = Infinity;
  export let step: number = 1;
  export let value: number = 0;
  export let unit: string = '';
  export let unitmultiple: string|null = null;
  let renderUnit = unit;

  if (!unitmultiple) {
    unitmultiple = unit;
  }

  const sanitize = (value: number) => {
    // Ensure value is a number
    if (isNaN(value)) {
      value = 0;
    }

    value = Math.min(value, max);
    value = Math.max(value, min);
    return value;
  }

  const increment = () => {
    count = sanitize(count + 1);
  }
  const decrement = () => {
    count = sanitize(count - 1);
  }

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    count = sanitize(parseInt(target.value));
  }

  $: count = value;

  $: {
    if (count === 1) {
      renderUnit = unit;
    } else {
      renderUnit = unitmultiple;
    }
  }
</script>

<div class={`input-group input-group--${type}`} style={`--value: ${count/max}`}>
  {#if type === 'increment'}
    <button class="button" on:click={decrement} aria-label="decrement">
      -
    </button>
    <input class="input-group__input" type="text" bind:value={count} on:input={handleInput} on:blur={handleInput} pattern="[0-9]" required />
    <button class="button" on:click={increment} aria-label="increment">
      +
    </button>
  {/if}

  {#if type === 'range'}
    <div class="input-group__valueunit">
      <span class="input-group__value">{count}</span>
      {#if unit}
        <span class="input-group__unit">{renderUnit}</span>
      {/if}
    </div>
    <div class="input-group__wrap">
      <input step={step} type="range" min={min} max={max} bind:value={count} on:input={handleInput} />
    </div>
  {/if}
</div>


<style>
  .input-group {
    display: flex;
    align-items: center;
    gap: var(--sr-input-gutter);
    align-items: stretch;
  }

  .input-group__input {
    width: 100%;
    text-align: center;
  }

  .input-group--range {
    position: relative;
    background: var(--cr-button);
    border-radius: var(--sr-button-radius);

    padding: var(--sr-button-gutter-y) var(--sr-button-gutter-x);
  }

  .input-group__wrap {
    position: absolute;
    top: 0; 
    bottom: 0;
    left: calc(var(--sr-button-gutter-x) / 4);
    right: calc(var(--sr-button-gutter-x) / 4);
  }

  .input-group--range input[type="range"] {
    position: absolute;
    width: 100%;
    cursor: pointer;
    bottom: 0;
    transform: translateY(50%);
  }

  .input-group--range input[type="text"] {
    font-weight: bold;
    width: fit-content;
  }

  .input-group__valueunit {
    display: flex;
    gap: var(--sr-input-gutter);
    margin: auto;
  }

  .input-group__value {
    font-weight: bold;
  }

  .input-group__unit {
    font-weight: normal;
  }

  .input-group--range::before {
    content: '';
    position: absolute;
    height: 1px;
    left: calc(var(--sr-button-gutter-x) / 3); 
    right: calc(var(--sr-button-gutter-x) / 3);
    background: linear-gradient(to right, var(--cr-interaction) 0% calc(var(--value, 0) * 100%), rgba(0 0 0 / 20%) calc(var(--value, 0) * 100%) 100%);
    bottom: 0;
  }
</style>


