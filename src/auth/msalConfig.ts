import { Configuration } from "@azure/msal-browser";
import { env } from "@/config/env";

const authority = `https://login.microsoftonline.com/${env.NEXT_PUBLIC_AZURE_TENANT_ID}`;

export const msalConfig: Configuration = {
  auth: {
    clientId: env.NEXT_PUBLIC_AZURE_CLIENT_ID,
    authority,
    knownAuthorities: [authority],
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      logLevel: 3, // Error level
      piiLoggingEnabled: false,
    },
  },
};

// Interactive login scopes: request OIDC + API delegated permission
export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "offline_access",
    `${env.NEXT_PUBLIC_AZURE_API_AUDIENCE}/access_as_user`,
  ],
};

// Silent token acquisition scopes: use .default for the API audience
export const tokenRequest = {
  scopes: [`${env.NEXT_PUBLIC_AZURE_API_AUDIENCE}/.default`],
};
