import type { Request } from 'express';
import { extractJwtFromCookie } from './jwt.strategy';

describe('extractJwtFromCookie', () => {
  it('returns the token when the access_token cookie is present', () => {
    const req = {
      cookies: { access_token: 'abc.def.ghi' },
    } as unknown as Request;

    expect(extractJwtFromCookie(req)).toBe('abc.def.ghi');
  });

  it('returns null when there is no access_token cookie', () => {
    const req = { cookies: {} } as unknown as Request;

    expect(extractJwtFromCookie(req)).toBeNull();
  });

  it('returns null when cookies were not parsed on the request', () => {
    const req = {} as unknown as Request;

    expect(extractJwtFromCookie(req)).toBeNull();
  });
});
