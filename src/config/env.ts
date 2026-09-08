export const environment = {
  webBaseUrl: process.env.WEB_BASE_URL ?? 'https://front.serverest.dev',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://serverest.dev',
} as const;
