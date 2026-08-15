import { describe, expect, it } from 'vitest';
import {
  challengeShareUrl,
  decodeChallengeSeed,
  encodeChallengeSeed,
  parseChallengeFromLocation,
} from './challenge';

describe('challenge codes', () => {
  it('round-trips seeds', () => {
    const seeds = [1, 42, 0xdeadbeef, 123456789, 0xffffffff];
    for (const seed of seeds) {
      const code = encodeChallengeSeed(seed);
      expect(code.length).toBeGreaterThanOrEqual(6);
      expect(decodeChallengeSeed(code)).toBe(seed >>> 0);
    }
  });

  it('rejects garbage codes', () => {
    expect(decodeChallengeSeed('')).toBeNull();
    expect(decodeChallengeSeed('!!')).toBeNull();
    expect(decodeChallengeSeed('AB')).toBeNull();
  });

  it('parses hash and query', () => {
    expect(parseChallengeFromLocation({ hash: '#c=ABCDEF', search: '', pathname: '/' })).toBe(
      'ABCDEF',
    );
    expect(
      parseChallengeFromLocation({ hash: '', search: '?challenge=XYZ234', pathname: '/' }),
    ).toBe('XYZ234');
    expect(parseChallengeFromLocation({ hash: '#c=!!', search: '', pathname: '/' })).toBeNull();
  });

  it('parses the shareable /c/CODE path', () => {
    expect(parseChallengeFromLocation({ hash: '', search: '', pathname: '/c/ABCDEF' })).toBe(
      'ABCDEF',
    );
    expect(parseChallengeFromLocation({ hash: '', search: '', pathname: '/c/!!' })).toBeNull();
    expect(parseChallengeFromLocation({ hash: '', search: '', pathname: '/' })).toBeNull();
  });

  it('shares a crawlable path so links can render a preview image', () => {
    const url = challengeShareUrl('ABCDEF', 'https://example.test');
    expect(url).toBe('https://example.test/c/ABCDEF');
    expect(url).not.toContain('#');
  });

  it('still accepts legacy hash links', () => {
    const code = encodeChallengeSeed(4242);
    expect(
      parseChallengeFromLocation({ hash: `#c=${code}`, search: '', pathname: '/' }),
    ).toBe(code);
  });
});
