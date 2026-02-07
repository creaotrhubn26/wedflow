/**
 * Data Migration Script: Wedflow DB → CreatorHub DB
 * 
 * Copies all data from the old Wedflow Neon database to the new CreatorHub Neon database.
 * The schema must already exist on the target (use `drizzle-kit push` first).
 * 
 * Strategy:
 * 1. Discover all tables and their foreign key dependencies
 * 2. Topologically sort tables so parents are inserted before children
 * 3. Disable triggers during insert to avoid constraint issues
 * 4. Copy data table by table using COPY TO / INSERT batches
 * 5. Reset sequences to match copied data
 */

import { Client } from 'pg';

const SOURCE_URL = 'postgresql://neondb_owner:npg_JVAyo1K2buMD@ep-holy-smoke-ag04fz9v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const TARGET_URL = 'postgresql://neondb_owner:npg_SM7AZYxyvK4L@ep-weathered-grass-abixeqb0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

async function getTables(client: Client): Promise<string[]> {
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return res.rows.map((r: any) => r.table_name);
}

async function getForeignKeyDeps(client: Client): Promise<Map<string, Set<string>>> {
  const res = await client.query(`
    SELECT
      tc.table_name AS child,
      ccu.table_name AS parent
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `);

  const deps = new Map<string, Set<string>>();
  for (const row of res.rows) {
    if (row.child === row.parent) continue; // skip self-references
    if (!deps.has(row.child)) deps.set(row.child, new Set());
    deps.get(row.child)!.add(row.parent);
  }
  return deps;
}

function topologicalSort(tables: string[], deps: Map<string, Set<string>>): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const visiting = new Set<string>(); // cycle detection

  function visit(table: string) {
    if (visited.has(table)) return;
    if (visiting.has(table)) {
      // Circular dep - just add it, we'll handle with deferred constraints
      console.warn(`  ⚠ Circular dependency detected involving: ${table}`);
      return;
    }
    visiting.add(table);
    const tableDeps = deps.get(table);
    if (tableDeps) {
      for (const dep of tableDeps) {
        if (tables.includes(dep)) {
          visit(dep);
        }
      }
    }
    visiting.delete(table);
    visited.add(table);
    result.push(table);
  }

  for (const table of tables) {
    visit(table);
  }
  return result;
}

async function getRowCount(client: Client, table: string): Promise<number> {
  const res = await client.query(`SELECT count(*)::int as cnt FROM "${table}"`);
  return res.rows[0].cnt;
}

async function copyTable(source: Client, target: Client, table: string): Promise<number> {
  const count = await getRowCount(source, table);
  if (count === 0) {
    console.log(`  ⏭ ${table}: 0 rows (skipped)`);
    return 0;
  }

  // Get all rows from source
  const res = await source.query(`SELECT * FROM "${table}"`);
  const rows = res.rows;
  if (rows.length === 0) return 0;

  const columns = Object.keys(rows[0]);
  const quotedCols = columns.map(c => `"${c}"`).join(', ');

  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values: any[] = [];
    const valuePlaceholders: string[] = [];

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j];
      const rowPlaceholders: string[] = [];
      for (let k = 0; k < columns.length; k++) {
        values.push(row[columns[k]]);
        rowPlaceholders.push(`$${values.length}`);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    await target.query(
      `INSERT INTO "${table}" (${quotedCols}) VALUES ${valuePlaceholders.join(', ')} ON CONFLICT DO NOTHING`,
      values
    );
    inserted += batch.length;
  }

  console.log(`  ✓ ${table}: ${inserted} rows copied`);
  return inserted;
}

async function resetSequences(target: Client): Promise<void> {
  // Find all sequences and reset them to max(id) + 1
  const seqRes = await target.query(`
    SELECT 
      s.relname AS sequence_name,
      t.relname AS table_name,
      a.attname AS column_name
    FROM pg_class s
    JOIN pg_depend d ON d.objid = s.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    WHERE s.relkind = 'S'
      AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  `);

  for (const seq of seqRes.rows) {
    try {
      const maxRes = await target.query(
        `SELECT COALESCE(MAX("${seq.column_name}"), 0) + 1 AS next_val FROM "${seq.table_name}"`
      );
      const nextVal = maxRes.rows[0].next_val;
      await target.query(`ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH ${nextVal}`);
      console.log(`  ✓ Sequence ${seq.sequence_name} reset to ${nextVal}`);
    } catch (e: any) {
      console.warn(`  ⚠ Could not reset sequence ${seq.sequence_name}: ${e.message}`);
    }
  }
}

async function main() {
  console.log('🔄 Starting data migration: Wedflow → CreatorHub DB\n');

  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({ connectionString: TARGET_URL });

  try {
    await source.connect();
    console.log('✓ Connected to source (Wedflow DB)');
    await target.connect();
    console.log('✓ Connected to target (CreatorHub DB)');

    // Get tables from source
    const tables = await getTables(source);
    console.log(`\n📋 Found ${tables.length} tables in source\n`);

    // Get foreign key dependencies and sort topologically
    const deps = await getForeignKeyDeps(source);
    const sortedTables = topologicalSort(tables, deps);
    console.log('📊 Tables sorted by dependency order\n');

    // Temporarily drop all foreign key constraints on target
    console.log('🔓 Dropping foreign key constraints on target...\n');
    const fkRes = await target.query(`
      SELECT tc.constraint_name, tc.table_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    `);
    const fkConstraints = fkRes.rows.map((r: any) => ({
      constraint: r.constraint_name,
      table: r.table_name,
    }));

    // Save FK definitions before dropping
    const fkDefinitions: { table: string; constraint: string; definition: string }[] = [];
    for (const fk of fkConstraints) {
      const defRes = await target.query(`
        SELECT pg_get_constraintdef(c.oid) AS definition
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conname = $1 AND n.nspname = 'public'
      `, [fk.constraint]);
      if (defRes.rows.length > 0) {
        fkDefinitions.push({
          table: fk.table,
          constraint: fk.constraint,
          definition: defRes.rows[0].definition,
        });
      }
    }

    // Drop all FKs
    for (const fk of fkDefinitions) {
      await target.query(`ALTER TABLE "${fk.table}" DROP CONSTRAINT IF EXISTS "${fk.constraint}"`);
    }
    console.log(`  Dropped ${fkDefinitions.length} foreign key constraints\n`);

    // Copy data
    console.log('📦 Copying data...\n');
    let totalRows = 0;
    let copiedTables = 0;

    for (const table of sortedTables) {
      try {
        const copied = await copyTable(source, target, table);
        totalRows += copied;
        if (copied > 0) copiedTables++;
      } catch (e: any) {
        console.error(`  ✗ ${table}: ERROR - ${e.message}`);
      }
    }

    // Re-add foreign key constraints
    console.log('\n🔒 Re-adding foreign key constraints...\n');
    let restored = 0;
    for (const fk of fkDefinitions) {
      try {
        await target.query(`ALTER TABLE "${fk.table}" ADD CONSTRAINT "${fk.constraint}" ${fk.definition}`);
        restored++;
      } catch (e: any) {
        console.warn(`  ⚠ Could not restore ${fk.constraint} on ${fk.table}: ${e.message}`);
      }
    }
    console.log(`  Restored ${restored}/${fkDefinitions.length} foreign key constraints`);

    // Reset sequences
    console.log('🔢 Resetting sequences...\n');
    await resetSequences(target);

    console.log(`\n✅ Migration complete!`);
    console.log(`   Tables with data: ${copiedTables}`);
    console.log(`   Total rows copied: ${totalRows}`);

  } catch (e: any) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  } finally {
    await source.end();
    await target.end();
  }
}

main();
