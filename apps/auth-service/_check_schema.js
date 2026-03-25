require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'auth'")
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); p.end(); })
  .catch(e => { console.error(e.message); p.end(); });
