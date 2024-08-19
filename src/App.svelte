<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import PieChart from './lib/PieChart.svelte'
  import Card from './lib/Card.svelte'
</script>

<main>
  <!--div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div-->
  <h1>Dashboard</h1>

  <aside>
    <h1 class="t-discrete">Presets</h1>
    <form>
      <ul class="l-horizontal">
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <input type="radio" name="preset" value="1" checked />
            <strong class="t-strong">Landing Page</strong>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <input type="radio" name="preset" value="2" />
            <strong class="t-strong">Social network</strong>
            <span>1000 users</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <input type="radio" name="preset" value="3" />
            <strong class="t-strong">Decentralized exchange</strong>
            <span>100 token pairs & 1000 users</span>
          </Card>
        </li>
        <li class="l-1/4 l-1/2@mobile stretch-vertical">
          <Card tag="label" selectable={true}>
            <input type="radio" name="preset" value="4" />
            <strong class="t-strong">Custom presets</strong>
          </Card>
        </li>
      </ul>
    </form>
  </aside>

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
