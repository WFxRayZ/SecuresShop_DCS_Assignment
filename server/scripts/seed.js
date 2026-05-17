require('dotenv').config();
const bcrypt = require('bcrypt');
const { getPool } = require('../db/db');

async function main() {
  const pool = await getPool();
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await pool.request()
    .input('password', passwordHash)
    .query(`
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com')
    BEGIN
      INSERT INTO users (name, email, password, role)
      VALUES (N'Admin', 'admin@example.com', @password, 'Admin');
    END
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = N'Example Product')
    BEGIN
      INSERT INTO products (name, description, price, stock)
      VALUES (N'Example Product', N'This is a sample product for SecureShop.', 9.99, 100);
    END
  `);

  console.log('Seed completed');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});