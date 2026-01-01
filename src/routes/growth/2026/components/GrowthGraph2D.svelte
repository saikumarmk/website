<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { GraphNode, GraphLink } from '../types';
  import { getBranchColor, TIER_LABELS } from '../utils/nodeUtils';
  import { computeElkLayout } from '../utils/elkLayout';

  export let nodes: GraphNode[];
  export let links: GraphLink[];
  export let selectedNode: GraphNode | null = null;

  let container: HTMLDivElement;
  let graphInstance: any;
  let hoveredNode: GraphNode | null = null;
  let lastNodesHash = '';
  let lastLinksHash = '';

  // Apply ELK layout and render
  async function applyLayout() {
    if (!graphInstance || nodes.length === 0) return;

    try {
      const layoutedNodes = await computeElkLayout(nodes, links);

      graphInstance
        .graphData({ nodes: layoutedNodes, links })
        .nodeId('id')
        .nodeLabel((node: GraphNode) => node.title)
        .nodeCanvasObject(drawNode)
        .nodeCanvasObjectMode(() => 'replace')
        .nodePointerAreaPaint(drawNodeHitbox)
        .linkCanvasObject(drawLink)
        .linkCanvasObjectMode(() => 'replace')
        .linkDirectionalArrowLength(0)
        .onNodeClick((node: GraphNode) => {
          console.log('Node clicked:', node.id, node.title);
          selectedNode = node;
        })
        .onNodeHover((node: GraphNode | null) => {
          hoveredNode = node;
          container.style.cursor = node ? 'pointer' : 'grab';
        })
        .d3Force('charge', null)
        .d3Force('center', null)
        .d3Force('link', null)
        .cooldownTicks(0)
        .enableNodeDrag(false)
        .enableZoomInteraction(true)
        .enablePanInteraction(true);

      // Zoom to fit after layout
      setTimeout(() => {
        if (graphInstance) {
          graphInstance.zoomToFit(400, 50);
        }
      }, 100);
    } catch (error) {
      console.error('ELK layout error:', error);
    }
  }

  // Define clickable area for nodes
  // Note: force-graph signature is (node, color, ctx, globalScale)
  function drawNodeHitbox(node: GraphNode, color: string, ctx: CanvasRenderingContext2D) {
    const width = node.width || 180;
    const height = node.height || 80;
    const x = node.x || 0;
    const y = node.y || 0;

    ctx.fillStyle = color;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
  }

  // Custom node drawing function
  function drawNode(node: GraphNode, ctx: CanvasRenderingContext2D) {
    const width = node.width || 180;
    const height = node.height || 80;
    const x = node.x || 0;
    const y = node.y || 0;

    const isSelected = selectedNode?.id === node.id;
    const branchColor = getBranchColor(node.branch);

    // Determine status styling
    const isLocked = node.status === 'locked';
    const isComplete = node.status === 'complete';
    const bgColor = isLocked ? '#2a2a2a' : isComplete ? '#1a4d2e' : '#3a3a3a';
    const borderColor = isSelected ? '#f0f0f0' : isLocked ? '#555' : '#777';
    const textColor = isLocked ? '#888' : '#f0f0f0';

    // Draw card background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = isSelected ? 3 : 1.5;
    if (isLocked) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
    ctx.setLineDash([]);

    // Draw branch color strip on left
    ctx.fillStyle = branchColor;
    ctx.fillRect(x - width / 2, y - height / 2, 6, height);

    // Draw tier badge (top-right)
    const tierLabel = TIER_LABELS[node.tier];
    const badgeSize = 24;
    const badgeX = x + width / 2 - badgeSize - 4;
    const badgeY = y - height / 2 + 4;

    ctx.fillStyle = '#555';
    ctx.fillRect(badgeX, badgeY, badgeSize, badgeSize);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(badgeX, badgeY, badgeSize, badgeSize);

    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 9px "Pokemon GB", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.imageSmoothingEnabled = false;
    ctx.fillText(tierLabel, badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);

    // Draw status indicator (top-left)
    if (isComplete) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('✓', x - width / 2 + 12, y - height / 2 + 6);
    }

    // Draw title (centered, wrapped, truncated)
    ctx.fillStyle = textColor;
    ctx.font = '11px "Pokemon GB", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.imageSmoothingEnabled = false;

    const maxTextWidth = width - 24;
    const lineHeight = 14;
    const maxLines = 3;
    const startY = y - 8;

    wrapText(ctx, node.title, x, startY, maxTextWidth, lineHeight, maxLines);
  }

  // Text wrapping with truncation
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
  ) {
    const words = text.split(/[\s-]+/);
    let line = '';
    let lines = 0;
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        if (lines < maxLines - 1) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
          lines++;
        } else {
          // Last line, truncate and add ellipsis
          let truncatedLine = line;
          while (
            ctx.measureText(truncatedLine + '...').width > maxWidth &&
            truncatedLine.length > 0
          ) {
            truncatedLine = truncatedLine.slice(0, -1);
          }
          ctx.fillText(truncatedLine.trim() + '...', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    if (lines < maxLines) {
      ctx.fillText(line.trim(), x, currentY);
    } else if (line.trim() && lines === maxLines) {
      let truncatedLine = line;
      while (
        ctx.measureText(truncatedLine + '...').width > maxWidth &&
        truncatedLine.length > 0
      ) {
        truncatedLine = truncatedLine.slice(0, -1);
      }
      ctx.fillText(truncatedLine.trim() + '...', x, currentY);
    }
  }

  // Custom link drawing function (orthogonal elbow edges)
  function drawLink(link: any, ctx: CanvasRenderingContext2D) {
    const source = link.source;
    const target = link.target;

    if (!source || !target) return;

    const sourceX = source.x || 0;
    const sourceY = source.y || 0;
    const targetX = target.x || 0;
    const targetY = target.y || 0;

    const sourceWidth = source.width || 180;
    const targetWidth = target.width || 180;

    // Start from right edge of source
    const startX = sourceX + sourceWidth / 2;
    const startY = sourceY;

    // End at left edge of target
    const endX = targetX - targetWidth / 2;
    const endY = targetY;

    // Elbow midpoint
    const midX = (startX + endX) / 2;

    // Style based on target status
    const targetLocked = target.status === 'locked';
    const lineColor = targetLocked ? '#555' : '#888';
    const lineWidth = 2;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    if (targetLocked) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw elbow path
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, startY);
    ctx.lineTo(midX, endY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw arrowhead
    const arrowSize = 8;
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize, endY - arrowSize / 2);
    ctx.lineTo(endX - arrowSize, endY + arrowSize / 2);
    ctx.closePath();
    ctx.fill();
  }

  onMount(async () => {
    if (!browser) return;

    const ForceGraph = (await import('force-graph')).default;
    
    // Get background color from CSS variable or default
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--b3')
      .trim() || '#1a1a1a';
    
    graphInstance = ForceGraph()(container)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .backgroundColor(bgColor);

    await applyLayout();

    return () => {
      if (graphInstance) {
        graphInstance._destructor();
      }
    };
  });

  // Re-apply layout only when data genuinely changes
  $: if (browser && graphInstance) {
    const nodesHash = nodes.map(n => n.id).join(',');
    const linksHash = links.map(l => `${l.source}-${l.target}`).join(',');
    
    if (nodesHash !== lastNodesHash || linksHash !== lastLinksHash) {
      lastNodesHash = nodesHash;
      lastLinksHash = linksHash;
      applyLayout();
    }
  }
</script>

<div bind:this={container} class="w-full h-full" />



