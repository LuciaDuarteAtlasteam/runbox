"use server";
import { sql } from "@vercel/postgres";
import { InstanceForm, User } from "./definitions";
import { auth } from "@/auth";

export async function fetchInstanceData() {
  const session = await auth();
  console.log(session);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    throw new Error("User not logged in.");
  }
  const user = await sql<User>`SELECT * FROM users WHERE email=${userEmail}`;
  const userId = user.rows[0].id;

  try {
    const data = await sql<InstanceForm>`
      SELECT * FROM instanceForm WHERE user_id = ${userId};

    `;
    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instance_data data.");
  }
}
