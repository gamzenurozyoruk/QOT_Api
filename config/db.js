import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const postgresClient = new pg.Pool({
  user: "postgresqot",
  password: "12345678",
  host: "qotdb.c7s2co4k2ln2.eu-central-1.rds.amazonaws.com",
  database: "qotdb",
  port: "5432",
  ssl: {
    rejectUnauthorized: false,
  },
});

export default postgresClient;