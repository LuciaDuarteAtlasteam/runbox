"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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
      INSERT INTO instance_data (auth_token, email, instance)
      VALUES (${authToken}, ${email}, ${instance})
    `;
  } catch (error) {
    console.error(error);
    return { message: "Database error: failed to save user data." };
  }

  // Revalidate cache for the users page if necessary
  revalidatePath("/dashboard/users");
  return { message: "User data saved successfully." };
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
