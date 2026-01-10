#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function main() {
  console.log('🌳 Yggdrasil: Backfilling missing node pages...\n');

  // Load growth data
  const jsonPath = path.join(rootDir, 'src', 'resources', 'growth2026.json');
  const growthData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let created = 0;
  let skipped = 0;

  for (const node of growthData.nodes) {
    const nodeDir = path.join(rootDir, 'urara', 'growth', '2026', node.id);
    const pagePath = path.join(nodeDir, '+page.md');

    // Check if page already exists
    if (fs.existsSync(pagePath)) {
      console.log(`⏭️  Skipped: ${node.id} (page exists)`);
      skipped++;
      continue;
    }

    // Create directory
    if (!fs.existsSync(nodeDir)) {
      fs.mkdirSync(nodeDir, { recursive: true});
    }

    // Create page
    const currentDate = new Date().toISOString().split('T')[0];
    const pageContent = `---
title: '${node.title}'
created: ${currentDate}
updated: ${currentDate}
tags: [${node.tags.join(', ')}]
growth:
  node_id: '${node.id}'
  branch: '${node.branch}'
  tier: '${node.tier}'
  estimate_hours: ${node.estimate_hours}
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

Brief introduction to ${node.title}.

## Key Concepts

<ConceptChecklist nodeId="${node.id}" {concepts} />

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

    fs.writeFileSync(pagePath, pageContent);
    console.log(`✅ Created: ${node.id}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created} pages`);
  console.log(`  Skipped: ${skipped} pages (already exist)`);
  console.log(`\n✅ Backfill complete!`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});




