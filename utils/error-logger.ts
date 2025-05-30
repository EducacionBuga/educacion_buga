export function logError(message: string, error: unknown): void {
  console.error(`${message}:`, error)

  // Aquí puedes integrar servicios de monitoreo como Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, {
  //     extra: { message },
  //   });
  // }
}
