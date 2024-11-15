import { db } from "@vercel/postgres";

const client = await db.connect();

async function createInstanceTable() {
  await client.sql`
   CREATE TABLE instanceForm (
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

export async function GET() {
  try {
    await client.sql`BEGIN`;

    await createInstanceTable();
    await client.sql`COMMIT`;

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
