const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: { encrypt: false }
};

const poolPromise = sql.connect(config).then(pool => pool).catch(err => {
  console.error('DB Connection Failed -', err);
  throw err;
});

module.exports = { sql, poolPromise };
