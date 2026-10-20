import { describe, expect, it } from 'vitest';
import { passwordStrength } from './passwordStrength.ts';

describe('passwordStrength', () => {
  it('calls an empty password the weakest there is', () => {
    expect(passwordStrength('')).toEqual({ score: 0, label: 'Very weak' });
  });

  it('climbs with length, mixed case, digits and symbols', () => {
    expect(passwordStrength('abcdefgh').score).toBe(1);
    expect(passwordStrength('abcdefghijkl').score).toBe(2);
    expect(passwordStrength('Abcdefghijkl').score).toBe(3);
    expect(passwordStrength('Abcdefghijk1').score).toBe(4);
  });

  it('stops at the top of the scale instead of running past the labels', () => {
    expect(passwordStrength('Abcdefghijk1!')).toEqual({ score: 4, label: 'Strong' });
  });

  it('gives every score a label', () => {
    const labels = ['', 'abcdefgh', 'abcdefghijkl', 'Abcdefghijkl', 'Abcdefghijk1'].map(
      (password) => passwordStrength(password).label,
    );

    expect(labels).toEqual(['Very weak', 'Weak', 'Fair', 'Good', 'Strong']);
  });
});
