import { sql } from "@vercel/postgres";
import { InstanceData } from "./definitions";

export async function fetchInstanceData() {
  try {
    console.log("Fetching instance_data...");

    const data = await sql<InstanceData>`SELECT * FROM instance_data`;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instance_data data.");
  }
}
