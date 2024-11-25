import bcrypt from "bcrypt";
import { db } from "@vercel/postgres";
import { users } from "../lib/placeholder-data";

const client = await db.connect();

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function createInstanceTable() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS instanceForm (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_token TEXT NOT NULL,
      email VARCHAR(255) NOT NULL,
      instance VARCHAR(255) NOT NULL,
      user_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
}

async function createScriptResultsTable() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS script_results (
      id SERIAL PRIMARY KEY,
      script_name VARCHAR(255) NOT NULL,
      parameters JSONB NOT NULL,
      result JSONB NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      execution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;

    await seedUsers();
    await createInstanceTable();
    await createScriptResultsTable();

    await client.sql`COMMIT`;

    return new Response(
      JSON.stringify({
        message: "Database seeded and tables created successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    await client.sql`ROLLBACK`;
    return new Response(
      JSON.stringify({ error: error || "Database operation failed" }),
      { status: 500 }
    );
  }
}
