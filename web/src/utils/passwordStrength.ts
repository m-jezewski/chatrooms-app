// Lightweight, dependency-free strength heuristic — enough to nudge users, not a security control.
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;

export function passwordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  return { score: clamped, label: LABELS[clamped] };
}
