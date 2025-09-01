import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_AZURE_CLIENT_ID: z.string().min(1, "Missing Azure Client ID"),
  NEXT_PUBLIC_AZURE_TENANT_ID: z.string().min(1, "Missing Azure Tenant ID"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url("API base must be a valid URL"),
  NEXT_PUBLIC_AZURE_API_AUDIENCE: z
    .string()
    .min(1, "Missing Azure API Audience (api://...)"),
  NEXT_PUBLIC_AUTH_BYPASS: z.string().optional(),
});

export type PublicEnv = z.infer<typeof EnvSchema>;

export const env: PublicEnv = (() => {
  const parsed = EnvSchema.safeParse({
    NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID,
    NEXT_PUBLIC_AZURE_TENANT_ID: process.env.NEXT_PUBLIC_AZURE_TENANT_ID,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_AZURE_API_AUDIENCE: process.env.NEXT_PUBLIC_AZURE_API_AUDIENCE,
  });
  if (!parsed.success) {
    console.error(
      "Environment validation failed:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
})();
