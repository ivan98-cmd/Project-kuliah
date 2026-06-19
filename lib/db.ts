import mysql, { Pool } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: Pool | undefined;
}

const pool: Pool = global.mysqlPool ?? mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'syncevent',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

if (process.env.NODE_ENV !== 'production') {
  global.mysqlPool = pool;
}

export default pool;
