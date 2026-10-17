import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeApiIntegrations } from './sanitizeApiIntegrations';

test('removes gateway credentials and custom URLs while preserving safe preferences', () => {
  const sanitized = sanitizeApiIntegrations({
    smsProvider: 'Greenweb',
    smsApiKey: 'sms-secret',
    smsSenderId: 'ERP',
    smsGatewayUrl: 'https://gateway.example/send?token=secret',
    bkashAppKey: 'bkash-key',
    bkashAppSecret: 'bkash-secret',
    nagadPublicKey: 'nagad-key',
    sslStorePass: 'ssl-secret',
    steadfastApiKey: 'courier-key',
    pathaoSecret: 'pathao-secret',
    btrcEirToken: 'eir-token',
    btrcWebhookUrl: 'https://internal.example/hook?token=secret',
    autoSmsOnSale: false,
    bkashEnvironment: 'Sandbox'
  });

  assert.deepEqual(sanitized, {
    smsProvider: 'Greenweb',
    smsSenderId: 'ERP',
    autoSmsOnSale: false,
    bkashEnvironment: 'Sandbox'
  });
});
