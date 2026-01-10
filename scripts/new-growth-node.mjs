#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function kebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌳 Creating new Growth Tree node...\n');

  // Collect inputs
  const title = await question('Node title: ');
  const id = kebabCase(await question(`Node ID (kebab-case) [${kebabCase(title)}]: `) || title);
  const branch = await question('Branch (systems-hpc/gen-video/rl-posttraining/math-foundations/swe-craft/physics/research): ');
  const tier = await question('Tier (roots/trunk/branch/crown): ');
  const tagsInput = await question('Tags (comma-separated): ');
  const estimateHours = parseInt(await question('Estimate hours: ') || '10');

  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  const currentDate = new Date().toISOString().split('T')[0];

  console.log('\n📝 Creating files...\n');

  // 1. Create node page directory in urara/
  const nodeDir = path.join(rootDir, 'urara', 'growth', '2026', id);

  if (!fs.existsSync(nodeDir)) {
    fs.mkdirSync(nodeDir, { recursive: true });
    console.log(`✓ Created directory: urara/growth/2026/${id}/`);
  }

  // 2. Create page template
  const pageContent = `---
title: '${title}'
created: ${currentDate}
updated: ${currentDate}
tags: [${tags.join(', ')}]
growth:
  node_id: '${id}'
  branch: '${branch}'
  tier: '${tier}'
  estimate_hours: ${estimateHours}
---

<script context="module">
  export const concepts = [
    { id: 'concept-1', title: 'Core Concept 1' },
    { id: 'concept-2', title: 'Core Concept 2' }
  ];
</script>

<script>
  import ConceptChecklist from '$lib/components/growth/ConceptChecklist.svelte';
</script>

## Overview

Brief introduction to ${title}.

## Key Concepts

<ConceptChecklist nodeId="${id}" {concepts} />

## Learning Path

### Concept 1

Content here...

### Concept 2

Content here...

## Implementation

Practical examples and code...

## Resources

- Resource 1
- Resource 2

## Next Steps

What to learn after completing this node.
`;

  const pagePath = path.join(nodeDir, '+page.md');
  fs.writeFileSync(pagePath, pageContent);
  console.log(`✓ Created page: urara/growth/2026/${id}/+page.md`);

  // 3. Update growth2026.json
  const jsonPath = path.join(rootDir, 'src', 'resources', 'growth2026.json');
  const growthData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const newNode = {
    id,
    title,
    branch,
    tier,
    prerequisites: [],
    estimate_hours: estimateHours,
    tags,
    artifact: {
      type: 'repo',
      url: ''
    },
    status: 'locked',
    page_path: `/growth/2026/${id}`
  };

  growthData.nodes.push(newNode);

  fs.writeFileSync(jsonPath, JSON.stringify(growthData, null, 4) + '\n');
  console.log(`✓ Added node to growth2026.json`);

  console.log(`\n✅ Node created successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit urara/growth/2026/${id}/+page.md`);
  console.log(`2. Add prerequisites and edges in growth2026.json`);
  console.log(`3. Run 'pnpm run dev' to see your changes (urara will copy to src/routes/)`);
  console.log(`\nView at: http://localhost:5173/growth/2026/${id}`);

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});

