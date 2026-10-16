import { SystemSettings } from '../types/erp';

export const sanitizeApiIntegrations = (
  integrations: SystemSettings['apiIntegrations']
): SystemSettings['apiIntegrations'] => {
  if (!integrations) return integrations;

  const {
    smsApiKey,
    smsGatewayUrl,
    bkashAppKey,
    bkashAppSecret,
    nagadPublicKey,
    sslStoreId,
    sslStorePass,
    steadfastApiKey,
    steadfastSecret,
    pathaoClientId,
    pathaoSecret,
    btrcEirToken,
    btrcWebhookUrl,
    ...safeIntegrations
  } = integrations;

  return safeIntegrations;
};

export const sanitizeSystemSettings = (settings: SystemSettings): SystemSettings => ({
  ...settings,
  apiIntegrations: sanitizeApiIntegrations(settings.apiIntegrations)
});

export const sanitizePartialSystemSettings = (
  settings: Partial<SystemSettings>
): Partial<SystemSettings> => settings.apiIntegrations
  ? { ...settings, apiIntegrations: sanitizeApiIntegrations(settings.apiIntegrations) }
  : settings;
