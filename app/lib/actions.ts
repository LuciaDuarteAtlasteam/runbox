"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import type { ScriptResult, User } from "@/app/lib/definitions";

// Define user schema using Zod
const FormSchema = z.object({
  authToken: z.string().min(1, { message: "Auth token is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  instance: z.string().min(1, { message: "Instance is required." }),
});

export type State = {
  errors?: {
    authToken?: string[];
    email?: string[];
    instance?: string[];
  };
  message?: string | null;
};

// Function to save user data to the database
export async function saveUserInstanceData(
  prevState: State,
  formData: FormData
) {
  // Get User id
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return { message: "User not authenticated." };
  }
  const user = await sql<User>`SELECT * FROM users WHERE email=${userEmail}`;
  const userId = user.rows[0].id;

  // Validate form fields using Zod
  const validatedFields = FormSchema.safeParse({
    authToken: formData.get("authToken"),
    email: formData.get("email"),
    instance: formData.get("instance"),
  });

  // If validation fails, return specific error messages
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: some fields are invalid.",
    };
  }

  // Prepare data for insertion into the database
  const { authToken, email, instance } = validatedFields.data;

  // Insert data into the users table
  try {
    await sql`
      INSERT INTO instanceForm (auth_token, email, instance, user_id)
      VALUES (${authToken}, ${email}, ${instance}, ${userId})
    `;
  } catch (error) {
    console.error(error);
    return { message: "Database error: failed to save user data." };
  }

  // Revalidate cache for the users page if necessary
  revalidatePath("/dashboard/users");
  return { message: "User data saved successfully." };
}
export async function updateInstanceData(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = FormSchema.safeParse({
    authToken: formData.get("authToken"),
    email: formData.get("email"),
    instance: formData.get("instance"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields.",
    };
  }

  const { authToken, email, instance } = validatedFields.data;

  try {
    await sql`
      UPDATE instanceForm
      SET auth_token = ${authToken}, email = ${email}, instance = ${instance}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Instance Data.",
      error,
    };
  }

  revalidatePath("/dashboard/user");
  redirect("/dashboard/user");
}
export async function deleteInstanceData(id: string) {
  try {
    await sql`DELETE FROM instanceForm WHERE id = ${id}`;
    revalidatePath("/dashboard/user");
    return { message: "Deleted Instance" };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Instance." };
  }
}
export async function saveScriptResult({
  scriptName,
  parameters,
  result,
  executedAt,
}: ScriptResult) {
  console.log("EXECUTED AT", executedAt);

  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return { message: "User not authenticated." };
  }
  try {
    await sql`
      INSERT INTO script_results (script_name, parameters, result, user_email, execution_date)
      VALUES (${scriptName}, ${JSON.stringify(parameters)}, ${JSON.stringify(
      result
    )}, ${userEmail}, ${executedAt})
    `;
    console.log("Script result saved successfully.");
  } catch (error) {
    console.error("Error saving script result:", error);
    throw new Error("Failed to save script result.");
  }
}
export async function fetchUserScriptResults() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    throw new Error("User not authenticated.");
  }
  try {
    const results = await sql`
      SELECT * FROM script_results
      WHERE user_email = ${userEmail}
      ORDER BY execution_date DESC;
    `;
    return results.rows;
  } catch (error) {
    console.error("Error fetching user script results:", error);
    throw new Error("Failed to fetch user script results.");
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
