const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:123@localhost:5432/flexeee',
  });
  const client = await pool.connect();
  try {
    const schemas = ['signals', 'actors', 'dso', 'sites', 'auth', 'logs'];
    for (const s of schemas) {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${s}"`);
      console.log('Created schema:', s);
    }
    const res = await client.query(
      "SELECT schema_name FROM information_schema.schemata ORDER BY schema_name"
    );
    console.log('All schemas:', res.rows.map(r => r.schema_name).join(', '));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
