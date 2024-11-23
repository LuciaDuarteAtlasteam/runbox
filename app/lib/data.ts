"use server";
import { sql } from "@vercel/postgres";
import { InstanceForm } from "./definitions";

export async function fetchInstanceData() {
  try {
    console.log("Fetching instance_data...");

    const data = await sql<InstanceForm>`SELECT * FROM instanceForm`;

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch instance_data data.");
  }
}
