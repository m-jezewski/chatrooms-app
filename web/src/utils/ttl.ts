import { SelectOption } from '../shared/SelectInput.tsx';

export const TTL_OPTIONS: SelectOption<number | null>[] = [
  { label: '1 hour', value: 60 * 60 * 1000 },
  { label: '12 hours', value: 12 * 60 * 60 * 1000 },
  { label: '24 hours', value: 24 * 60 * 60 * 1000 },
  { label: '1 week', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '1 month', value: 30 * 24 * 60 * 60 * 1000 },
  { label: 'Never', value: null },
];

export const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export const ttlOptionsFor = (isAccountOwned: boolean): SelectOption<number | null>[] =>
  isAccountOwned ? TTL_OPTIONS : TTL_OPTIONS.filter((option) => option.value !== null);

export const expiresAtFrom = (ttlMs: number | null): string | null =>
  ttlMs === null ? null : new Date(Date.now() + ttlMs).toISOString();

export const formatExpiry = (expiresAt: string | null): string =>
  expiresAt ? new Date(expiresAt).toLocaleString() : 'never';
