// Theme settings are shared between plugify.net and api.plugify.net: both sites
// read and write the same cookies on the parent domain. Keep the cookie names,
// the value format and this helper identical in both repositories.
export function sharedCookieOptions() {
  const host = import.meta.client ? window.location.hostname : '';
  const onPlugify = host === 'plugify.net' || host.endsWith('.plugify.net');
  return {
    // Other hosts (localhost, previews) keep an ordinary host-only cookie
    domain: onPlugify ? '.plugify.net' : undefined,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax' as const,
  };
}
