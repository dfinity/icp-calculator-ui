<script lang="ts">
  type PieChartData = {
    label: string,
    value: number,
    unit: string,
    color: string,
  }

  export let data: PieChartData[] = [];
  
</script>

<div class="piechart-legend">
  <ol>
    {#each data as { label, value, color, unit }, index}
      <li style="--c: {color};">
        <span class="piechart-legend__label">{label}</span>
        <strong class="piechart-legend__value">{unit}{value}</strong>
      </li>
    {/each}
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
    content: '';
    display: inline-block;
    width: 1ex;
    height: 1ex;
    border-radius: 50%;
    background: var(--c);
    margin-right: 1ex;
  }

</style>
