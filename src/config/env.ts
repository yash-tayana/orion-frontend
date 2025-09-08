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
    NEXT_PUBLIC_AZURE_CLIENT_ID:
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ||
      "62cbe778-2e7e-49f3-a659-c6b59bfc6a7f",
    NEXT_PUBLIC_AZURE_TENANT_ID:
      process.env.NEXT_PUBLIC_AZURE_TENANT_ID ||
      "e388d6da-c391-4e14-b2b3-1df356c587ed",
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
    NEXT_PUBLIC_AZURE_API_AUDIENCE:
      process.env.NEXT_PUBLIC_AZURE_API_AUDIENCE ||
      "api://62cbe778-2e7e-49f3-a659-c6b59bfc6a7f",
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
