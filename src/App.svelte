<script lang="ts">
  import Counter from './lib/Counter.svelte'
  import PieChart from './lib/PieChart.svelte'
  import Card from './lib/Card.svelte'

  // icons
  import PagesLine from './lib/icons/pages-line.svg.svelte';
  import GroupLine from './lib/icons/group-line.svg.svelte';
  import CoinsLine from './lib/icons/coins-line.svg.svelte';
  import PencilLine from './lib/icons/pencil-line.svg.svelte';
  
  import Number from './lib/Number.svelte'
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
    <div class="l-1/2 l-1/1@mobile">
      <Card tag="section">
        <div class="l-horizontal l-horizontal--center">
          <strong class="l-grow">Days</strong>
          <div class="l-1/2 l-shrink">
            <Number type="increment" min={1} max={31} value={1} />
          </div>
        </div>
        <hr class="l-stack" />
        <button class="button button--primary button--full l-stack">Add Items</button>
      </Card>
    </div>
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
  <div class="card">
    <Counter />
  </div>

  <PieChart data={[
    { value: 33.123, color: '#6348A0', label: 'Storage' },
    { value: 12.13, color: '#EE589F', label: 'Canister' },
    { value: 1.23, color: '#FAA634', label: 'Query Message' }
  ]} />

  <Card tag="section">
    <h2>Card Title</h2>
    <p>Card content goes here</p>
  </Card> 

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>
