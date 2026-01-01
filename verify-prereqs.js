// Manually verify prerequisite trees
import fs from 'fs';

const mthUnits = JSON.parse(fs.readFileSync('mth-units.json', 'utf8'));
const analysis = JSON.parse(fs.readFileSync('mth-analysis.json', 'utf8'));

console.log('🔍 MTH Prerequisite Tree Verification\n');
console.log('=' .repeat(60));

// Function to display unit with its prerequisites
function showPrereqs(code) {
  const unit = mthUnits.find(u => u.code === code);
  if (!unit) {
    console.log(`❌ ${code} not found`);
    return;
  }
  
  console.log(`\n${unit.code}: ${unit.title}`);
  console.log(`Level: ${unit.level / 1000}000`);
  
  if (unit.prerequisites.length === 0) {
    console.log('Prerequisites: None (foundation unit)');
  } else {
    console.log('Prerequisites:');
    unit.prerequisites.forEach(prereq => {
      const mthPrereqs = prereq.units.filter(u => u.startsWith('MTH'));
      if (mthPrereqs.length > 0) {
        console.log(`  - Requires ${prereq.numRequired} of: ${mthPrereqs.join(', ')}`);
      }
    });
  }
  
  const unlocks = analysis.unlockMap[code] || [];
  if (unlocks.length > 0) {
    console.log(`Unlocks: ${unlocks.join(', ')}`);
  } else {
    console.log('Unlocks: Nothing (terminal unit)');
  }
}

// Core pathway verification
console.log('\n\n📚 CORE PATHWAY VERIFICATION');
console.log('=' .repeat(60));

const corePath = [
  'MTH1030',
  'MTH2010',
  'MTH2021', 
  'MTH2032',
  'MTH2140',
  'MTH3011',
  'MTH3130',
  'MTH3160'
];

corePath.forEach(code => showPrereqs(code));

// Check mutual prereqs
console.log('\n\n🔄 MUTUAL PREREQUISITES');
console.log('=' .repeat(60));
['MTH2137', 'MTH3141'].forEach(code => showPrereqs(code));

// Hub units (unlock many)
console.log('\n\n🌟 HUB UNITS (unlock 5+ units)');
console.log('=' .repeat(60));
const hubs = analysis.hubs.slice(0, 5);
hubs.forEach(code => showPrereqs(code));


