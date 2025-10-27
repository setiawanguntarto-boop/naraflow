/**
 * Migration Script: Node Library v2 to v3
 * 
 * This script migrates all v2 nodes to v3 format.
 * Run with: npx tsx scripts/migrate-v2-to-v3.ts
 */

import { nodeLibrary, NodeDefinition } from '../src/core/nodeLibrary';
import { migrateV2ToV3 } from '../src/core/nodeLibraryMigration';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Node Library v2 to v3 migration...\n');

// Get all v2 nodes
const v2Nodes = Object.entries(nodeLibrary);

console.log(`Found ${v2Nodes.length} nodes in v2 library\n`);

// Track migration results
const migratedNodes: Array<{ id: string; v2Node: any; v3Node: any }> = [];
const errors: Array<{ id: string; error: string }> = [];

// Migrate each node
for (const [nodeId, v2Node] of v2Nodes) {
  try {
    console.log(`Migrating: ${nodeId}...`);
    
    const v3Node = migrateV2ToV3(v2Node);
    
    migratedNodes.push({ id: nodeId, v2Node, v3Node });
    
    console.log(`  ✅ Migrated: ${v3Node.label}\n`);
  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}\n`);
    errors.push({ id: nodeId, error: error.message });
  }
}

// Generate migration report
const report = {
  summary: {
    total: v2Nodes.length,
    successful: migratedNodes.length,
    errors: errors.length,
    timestamp: new Date().toISOString()
  },
  migrated: migratedNodes,
  errors
};

// Save report
mkdirSync(join(__dirname, '../migration-reports'), { recursive: true });
writeFileSync(
  join(__dirname, '../migration-reports/v2-to-v3-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(`\n✅ Migration complete!`);
console.log(`   Total nodes: ${v2Nodes.length}`);
console.log(`   Successfully migrated: ${migratedNodes.length}`);
console.log(`   Errors: ${errors.length}`);
console.log(`\n📄 Report saved to: migration-reports/v2-to-v3-report.json`);

// Generate TypeScript file with migrated nodes
if (migratedNodes.length > 0) {
  const outputFile = `src/core/nodes/v2-migrated.ts`;
  
  const tsContent = `/**
 * Auto-generated: Migrated Node Library v2 nodes to v3
 * Generated: ${new Date().toISOString()}
 * 
 * This file contains v2 nodes migrated to v3 format.
 * These nodes maintain backward compatibility with existing workflows.
 */

import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const v2MigratedNodes: Record<string, Partial<NodeTypeDefinition>> = {
${migratedNodes.map(({ id, v3Node }) => 
  `  '${id}': ${JSON.stringify(v3Node, null, 4)}`
).join(',\n\n')}
};

/**
 * Migration summary:
 * - Total v2 nodes: ${v2Nodes.length}
 * - Successfully migrated: ${migratedNodes.length}
 * - Errors: ${errors.length}
 */
`;

  // Create directory if it doesn't exist
  mkdirSync(join(__dirname, '../src/core/nodes'), { recursive: true });
  
  writeFileSync(
    join(__dirname, '../', outputFile),
    tsContent
  );
  
  console.log(`\n📝 Generated: ${outputFile}`);
}

// List migrated nodes
console.log('\n📋 Migrated Nodes:');
migratedNodes.forEach(({ id, v3Node }) => {
  console.log(`   - ${id}: ${v3Node.label}`);
});

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(({ id, error }) => {
    console.log(`   - ${id}: ${error}`);
  });
}

console.log('\n🎉 Migration script completed successfully!\n');

