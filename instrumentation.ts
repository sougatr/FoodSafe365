/**
 * Next.js Server Boot Instrumentation Hook
 * Executes once upon server startup to validate production configuration and secrets.
 * Fails fast if running in production without verified cryptographic secrets or database URL.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertProductionBoot } = await import('./lib/env-validator');
    assertProductionBoot();
  }
}
