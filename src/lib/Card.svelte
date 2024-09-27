<script lang="ts">
  import CheckLine from "./icons/check-line.svg.svelte";
  export let tag = "div";
  export let selectable = false;
  export let hasOutline = false;
  export let isTight = false;
  export let highlight = false;

  // add card class to restProps
  $: {
    $$restProps.class = `card ${$$restProps.class || ""}`;
    if (selectable) {
      $$restProps.class += " card--selectable";
    }
    if (hasOutline) {
      $$restProps.class += " card--outline";
    }
    if (isTight) {
      $$restProps.class += " card--tight";
    }
    if (highlight) {
      $$restProps.class += " card--highlight";
    }
  }
</script>

<svelte:element this={tag} {...$$restProps}>
  {#if selectable}
    <i class="card__status-icon" aria-hidden>
      <CheckLine />
    </i>
  {/if}
  <slot></slot>
</svelte:element>

<style>
  .card {
    --c-border: var(--cr-card-border);
    display: block;
    position: relative;
    padding: var(--sr-card-gutter);
    background: var(--cr-card);
    border-radius: var(--sr-card-radius);
  }

  .card--tight {
    padding: calc(var(--sr-card-gutter) * 0.25);
    padding-left: calc(var(--sr-card-gutter) * 0.75);
  }

  .card--outline {
    box-shadow: inset 0 0 0 1px var(--c-border);
  }

  .card--selectable {
    cursor: pointer;
    box-shadow: inset 0 0 0 1px var(--c-border);
    transition: box-shadow 0.2s;
    text-align: center;
    padding-left: calc(var(--sr-card-gutter) + 1.6rem);
    padding-right: calc(var(--sr-card-gutter) + 1.6rem);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.2em;
  }

  .card--selectable:has(input:checked) {
    --c-border: var(--cr-card-border--selected);
    box-shadow: inset 0 0 0 1px var(--c-border);
    color: var(--cr-card-border--selected);
  }

  .card--selectable :global(input) {
    display: none;
  }

  .card--selectable :global(*) {
    display: block;
  }

  .card__status-icon {
    position: absolute;
    top: var(--sr-card-gutter);
    right: var(--sr-card-gutter);
    width: 1.6rem;
    height: 1.6rem;
    background: var(--cr-card-border--selected);
    border-radius: 50%;
    color: var(--cr-card);
    opacity: 0;
    transform: scale(0.2);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }

  .card--selectable:has(input:checked) .card__status-icon {
    opacity: 1;
    transform: scale(1);
  }

  .card__status-icon :global(svg) {
    width: 1.2rem;
    height: 1.2rem;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0;
    transition:
      opacity 0.2s,
      transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .card--selectable:has(input:checked) .card__status-icon :global(svg) {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    transition-delay: 0.2s;
  }

  @keyframes highlight-fade {
    0% {
      background: var(--cr-card-highlight);
    }
    100% {
      background: var(--cr-card);
    }
  }

  .card--highlight {
    animation: highlight-fade 3s ease-out 1;
  }
</style>
