<script lang="ts">
  export let count: number = 0;
  export let type: string = 'increment';

  const increment = () => {
    count += 1
  }
  const decrement = () => {
    count -= 1
  }
</script>

<div class="input-group input-group--increment">
  <button class="button" on:click={increment} aria-label="increment">
    -
  </button>
  <input type="text" value={count} readonly />
  <button class="button" on:click={decrement} aria-label="decrement">
    +
  </button>
</div>
