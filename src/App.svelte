<script lang="ts">
  type PieChartData = {
    label: string
    value: number
    unit: string
    color?: string
  }
  import { spreadArray } from './lib/utils/spreadArray';

  import PieChart from './lib/PieChart.svelte'
  import PieChartLegend from './lib/PieChartLegend.svelte';
  import Card from './lib/Card.svelte'

  // icons
  import PagesLine from './lib/icons/pages-line.svg.svelte';
  import GroupLine from './lib/icons/group-line.svg.svelte';
  import CoinsLine from './lib/icons/coins-line.svg.svelte';
  import PencilLine from './lib/icons/pencil-line.svg.svelte';
  
  import Number from './lib/Number.svelte';

  // the design contains 3 colors
  const colorStops = ['var(--cr-data-1)', 'var(--cr-data-2)', 'var(--cr-data-3)'];
  const colorsNeeded = 7;

  const vizData:PieChartData[] = [
    { value: 33.123, label: 'Storage', unit: '$' },
    { value: 12.13, label: 'Canister', unit: '$' },
    { value: 2.23, label: 'Query Message', unit: '$' },
    { value: 1.2, label: 'Update Message', unit: '$' },
    { value: 4.23, label: 'Inter-Canister Call', unit: '$' },
    { value: 5.23, label: 'Timer', unit: '$' },
    { value: 12.23, label: 'Something Else', unit: '$' },
  ];

  // but we have X possible categories so lets interpolate the colors, since 
  // CSS supports color mixing we don't need any color lib to do so
  const colorsForCategories = spreadArray(
    colorStops, 
    vizData.length,
    (percent, currentValue, nextValue) => `color-mix(in okLab, ${currentValue} ${(1 - percent) * 100}%, ${nextValue})`
  );

  vizData.forEach((data, index) => {
    data.color = colorsForCategories[index];
  });

  
</script>

<main>
  <h1>Pricing Calculator</h1>

  <aside class="l-stack">
    <h1 class="t-discrete">Presets</h1>
    <form class="l-stack">
      <ul class="l-horizontal">
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <PagesLine />
            </span>
            <input type="radio" name="preset" value="1" checked />
            <strong class="h2">Landing Page</strong>
             <span class="t-discrete">&nbsp;</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <GroupLine />
            </span>
            <input type="radio" name="preset" value="2" />
            <strong class="h2">Social network</strong>
            <span class="t-discrete">1000 users</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <CoinsLine />
            </span>
            <input type="radio" name="preset" value="3" />
            <strong class="h2">Decentralized exchange</strong>
            <span class="t-discrete">100 token pairs & 1000 users</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <span class="icon">
              <PencilLine />
            </span>
            <input type="radio" name="preset" value="4" />
            <strong class="h2">Custom presets</strong>
             <span class="t-discrete">&nbsp;</span>
          </Card>
        </li>
      </ul>
    </form>
  </aside>

  <main class="l-horizontal l-stack l-stack--large">
    <!-- left sidebar -->
    <div class="l-1/2 l-1/1@mobile">
      <Card tag="section">
        <div class="l-horizontal l-horizontal--center">
          <strong class="l-grow">Days</strong>
          <div class="l-1/2 l-shrink">
            <Number type="increment" min={1} max={31} value={1} />
          </div>
        </div>
        <hr class="l-stack l-stack--large" />
        <div class="l-horizontal l-horizontal--center l-stack l-stack--large">
          <div class="l-grow">
            <PieChart data={vizData} />
          </div>
          <div class="l-2/3">
            <PieChartLegend data={vizData} />
          </div>
        </div>
        <button class="button button--primary button--full l-stack  l-stack--large">Add Items</button>
      </Card>
    </div>


    <!-- right cart content -->
    <section class="l-1/2 l-1/1@mobile l-vertical l-horizontal--center" aria-label="Cart Contents">
      <Card tag="aside" aria-label="Storage">
        <div class="l-horizontal l-stack">
          <strong class="l-grow">Storage</strong>
          <div class="l-1/2 l-shrink">
            <Number type="increment" min={0} max={100} value={1} />
          </div>
        </div>
        <div class="l-horizontal l-stack l-horizontal--center">
          <span class="l-grow">Size</span>
          <div class="l-1/2 l-shrink">
            <Number type="range" min={0} max={100} value={50} unit={'Mb'}/>
          </div>
        </div>
        <button class="l-stack button button--text button--danger button--right">Remove</button>
      </Card>

      <Card tag="aside" aria-label="Storage">
        <div class="l-horizontal l-horizontal--center">
          <strong class="l-grow">Query message</strong>
          <div class="l-1/2 l-shrink">
            <Number value={1000} type="increment" min={0} max={10000} />
          </div>
        </div>
        <div class="l-horizontal l-horizontal--center l-stack ">
          <span class="l-grow">Compute</span>
          <div class="l-1/2 l-shrink">
            <Number type="range" min={0} max={100} value={50} unit={'Mb'}/>
          </div>
        </div>

        <div class="l-horizontal l-horizontal--center l-stack">
          <span class="l-grow">Network bytes</span>
          <div class="l-1/2 l-shrink">
            <Number type="range" min={0} max={10000} value={500} unit={'Kb'}/>
          </div>
        </div>

        <div class="l-horizontal l-horizontal--center l-stack">
          <span class="l-grow">Repeat</span>
          <div class="l-1/2 l-shrink">
            <Number type="range" min={1} max={10} value={1} unit={'Day'} unitmultiple={'Days'} />
          </div>
        </div>

        <button class="l-stack button button--text button--danger button--right">Remove</button>
      </Card>
    </section>
  </main>
 
</main>
