<script lang="ts">
  type PieChartData = {
    label: string
    value: number
    unit: string
    color: string
  }
  
  export let data: PieChartData[] = [];

  let total = Infinity;

  $: {
    total = data.reduce((acc, { value }) => acc + value, 0);
  }

  let gradients:string[] = [];
  // generate conic-gradient(${color} ${start}% ${end}%...);

  $: {
    gradients = data.map(({ color, value }, index) => {
      const start = data.slice(0, index).reduce((acc, { value }) => acc + value, 0) / total * 100;
      const end = start + value / total * 100;
      return `conic-gradient(transparent ${start}%, ${color} ${start}% ${end}%, transparent ${end}%)`;
    });
  }

  let dataReversed = [...data].reverse();
  $: {
    dataReversed = [...data].reverse();
  }
</script>

<div class="piechart">
  {#each dataReversed as { label }, index}
    <div class="piechart__slice" style="background: {gradients[index]}; --i: {index/(data.length - 1)}; z-index: {dataReversed.length - index};" aria-label="{label}"></div>
  {/each}
</div>

<style>
  .piechart {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
  }

  .piechart__slice {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    transform: rotate(calc(-120deg * 1.2 - var(--i) * 45deg));
    animation: spinin 1s cubic-bezier(0.7, 0.3, 0 , 1) forwards;
    animation-delay: calc(var(--i) * .2s);
    opacity: 0;
  }

  .piechart::after {
    content: '';
    position: absolute;
    inset: 22%;
    background: var(--cr-card);
    border-radius: 50%;
    z-index: 1000;
  }

  @keyframes spinin {
    from {
      opacity: 0;
    }
    20% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    to {
      opacity: 1;
      transform: rotate(0deg);
    }
  }

</style>
