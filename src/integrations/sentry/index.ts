
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (!import.meta.env.PROD) {
    console.log('Sentry not initialized in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: "https://public@sentry.example.com/1", // This will be replaced by the environment variable in the Supabase edge function
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: 'production',
    });
    console.log('Sentry initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

export const captureException = (error: unknown, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured (not sent to Sentry in dev):', error, context);
  }
};

export { Sentry };
