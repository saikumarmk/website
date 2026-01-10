#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function main() {
  const nodeId = process.argv[2];

  if (!nodeId) {
    console.error('Usage: pnpm run growth:page <node-id>');
    console.error('Example: pnpm run growth:page distributed-training-mental-models');
    process.exit(1);
  }

  // Load growth data
  const jsonPath = path.join(rootDir, 'src', 'resources', 'growth2026.json');
  const growthData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Find the node
  const node = growthData.nodes.find(n => n.id === nodeId);
  if (!node) {
    console.error(`Node "${nodeId}" not found in growth2026.json`);
    console.error('\nAvailable nodes:');
    growthData.nodes.forEach(n => console.log(`  - ${n.id}`));
    process.exit(1);
  }

  const nodeDir = path.join(rootDir, 'urara', 'growth', '2026', node.id);
  const pagePath = path.join(nodeDir, '+page.md');

  // Check if page already exists
  if (fs.existsSync(pagePath)) {
    console.log(`Page already exists: urara/growth/2026/${node.id}/+page.md`);
    process.exit(0);
  }

  // Create directory
  if (!fs.existsSync(nodeDir)) {
    fs.mkdirSync(nodeDir, { recursive: true });
  }

  // Create page
  const currentDate = new Date().toISOString().split('T')[0];
  const tags = node.tags || [];
  if (!tags.includes('yggdrasil')) tags.unshift('yggdrasil');
  if (!tags.includes(node.branch)) tags.push(node.branch);

  const pageContent = `---
title: '${node.title}'
created: ${currentDate}
updated: ${currentDate}
tags: [${tags.join(', ')}]
growth:
  node_id: '${node.id}'
  branch: '${node.branch}'
  tier: '${node.tier}'
  estimate_hours: ${node.estimate_hours || 10}
---

## Overview

Brief introduction to ${node.title}.

## Key Concepts

- Concept 1
- Concept 2

## Learning Path

Content here...

## Resources

- Resource 1
- Resource 2
`;

  fs.writeFileSync(pagePath, pageContent);
  console.log(`Created: urara/growth/2026/${node.id}/+page.md`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

