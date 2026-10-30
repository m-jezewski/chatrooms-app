import { describe, expect, it } from 'vitest';
import { cx } from './cx.ts';

describe('cx', () => {
  it('puts a single space between the classes it was given', () => {
    expect(cx('button', 'purple')).toBe('button purple');
  });

  it('leaves out the classes that did not apply, instead of writing them out', () => {
    expect(cx('item', false, undefined, null)).toBe('item');
  });

  it('says nothing at all when nothing applied', () => {
    expect(cx(false, undefined)).toBe('');
  });
});
