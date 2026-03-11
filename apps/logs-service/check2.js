const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:123@localhost:5432/flexeee' });
client.connect()
  .then(() => client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'logs'"))
  .then(r => { console.log(r.rows); return client.end(); })
  .catch(e => console.error(e));
