export function loginPath(destination: string): string {
  return `/login?returnTo=${encodeURIComponent(destination)}`;
}

export function loginDestination(search: string): string {
  const destination = new URLSearchParams(search).get('returnTo');
  if (!destination?.startsWith('/') || destination.startsWith('//') ||
    destination.includes('\\') || [...destination].some(character => character.charCodeAt(0) < 32)) return '/welcome';
  const pathname = new URL(destination, 'https://local.invalid').pathname;
  return pathname === '/login' || pathname.startsWith('/login/') ? '/welcome' : destination;
}
