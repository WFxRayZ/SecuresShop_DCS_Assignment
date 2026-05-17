const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool;

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

module.exports = { sql, getPool };
