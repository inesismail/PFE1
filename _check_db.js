const { Pool } = require('pg');
const p = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'flexeee' });

async function main() {
  const schemas = await p.query(
    "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('auth','actors','signals','sites','dso','logs')"
  );
  console.log('Schemas:', schemas.rows.map(x => x.schema_name));

  for (const s of schemas.rows) {
    const tables = await p.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = $1", [s.schema_name]
    );
    console.log(`  ${s.schema_name}:`, tables.rows.map(x => x.table_name));
  }
  await p.end();
}
main().catch(e => { console.error(e); p.end(); });
