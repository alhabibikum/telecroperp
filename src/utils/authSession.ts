import type { AuthUser } from '../types/erp';

/** Never persist secrets in the browser session blob. */
export function toPublicUser(user: AuthUser): AuthUser {
  const { password: _password, ...safe } = user;
  return { ...safe };
}

export function persistAuthSession(user: AuthUser) {
  const safe = toPublicUser(user);
  localStorage.setItem('TELECORP_AUTH_STATE', 'logged_in');
  localStorage.setItem('TELECORP_AUTH_USER', JSON.stringify(safe));
  return safe;
}
