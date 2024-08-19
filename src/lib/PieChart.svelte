<script lang="ts">
  type PieChartData = {
    label: string
    value: number
    color: string
  }
  
  export let data: PieChartData[] = [];
  
  export const virtualSize = 100;
  export const innerRadius = 0.25;
  export const sliceGap = 0.27;
  export const sliceBorderWidth = 0.04;
  export const startAngle = -90;

  let pxSliceGap: number;
  let pxSliceBorderWidth: number;
  
  $: {
    pxSliceGap = sliceGap * virtualSize;
    pxSliceBorderWidth = sliceBorderWidth * virtualSize;
  };

  export let paths: SVGElement;

  function createPaths(startAngle: number, endAngle: number) {
    const adjustedRadius = (virtualSize / 2) - pxSliceBorderWidth / 2;  // Adjust for border width
    const innerRadiusPX = adjustedRadius * innerRadius;

    // Outer arc points
    const x1 = adjustedRadius + adjustedRadius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = adjustedRadius + adjustedRadius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = adjustedRadius + adjustedRadius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = adjustedRadius + adjustedRadius * Math.sin((endAngle * Math.PI) / 180);

    // Inner arc points
    const x3 = adjustedRadius + innerRadiusPX * Math.cos((endAngle * Math.PI) / 180);
    const y3 = adjustedRadius + innerRadiusPX * Math.sin((endAngle * Math.PI) / 180);
    const x4 = adjustedRadius + innerRadiusPX * Math.cos((startAngle * Math.PI) / 180);
    const y4 = adjustedRadius + innerRadiusPX * Math.sin((startAngle * Math.PI) / 180);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M ${x1} ${y1} 
      A ${adjustedRadius} ${adjustedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} 
      L ${x3} ${y3} 
      A ${innerRadiusPX} ${innerRadiusPX} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`
    );

    return path;
  }

  function drawPaths() {
    const total = data.reduce((acc, { value }) => acc + value, 0);
    let startAngleLocal = startAngle;
    let endAngle = startAngle;

    data.forEach(({ value, color }) => {
      endAngle = startAngleLocal + (value / total) * 360;

      // Adjust end angle by subtracting the slice gap as an angle
      const path = createPaths(startAngleLocal, endAngle - (sliceGap * 360));
      path.setAttribute('fill', color);
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('stroke-width', `${pxSliceBorderWidth}`);
      paths.appendChild(path);

      // Adjust startAngleLocal for the next slice, add both gap and border width
      startAngleLocal = endAngle + (sliceGap * 360);
    })
  }

  $: if (paths) {
    console.log(paths)
    paths.innerHTML = '';
    drawPaths();
  }
</script>

<div class="piechart">
  <svg viewBox="0 0 {virtualSize} {virtualSize}" class="piechart__svg">
    <g class="piechart__svg" bind:this={paths}>

    </g>
  </svg>
</div>

<style>
  .piechart__svg {
    width: 100%;
    height: 100%;
  }
</style>
