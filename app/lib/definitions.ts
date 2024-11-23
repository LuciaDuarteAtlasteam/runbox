// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};
export type InstanceForm = {
  id: string;
  auth_token: string;
  email: string;
  instance: string;
  userId: string;
};
export type ScriptParameter = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};
export type Script = {
  name: string;
  path: string;
  description: string;
  parameters?: ScriptParameter[];
};
export type ScriptData = {
  scripts: Script[];
};
