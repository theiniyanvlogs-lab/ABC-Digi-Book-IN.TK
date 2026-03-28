export const KEYS = {
  activationCode: 'intk:activationCode',
  deviceId: 'intk:deviceId',
  babyPhoto: 'intk:babyPhoto',
  currentIndex: 'intk:currentIndex',
  isMuted: 'intk:isMuted',
  speechRate: 'intk:speechRate',
  speechPitch: 'intk:speechPitch',
  selectedVoiceURI: 'intk:selectedVoiceURI',
  speechUnlocked: 'intk:speechUnlocked',
} as const;

export function getValue(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function setValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function removeValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function getBool(key: string, fallback = false): boolean {
  const raw = getValue(key);
  if (!raw) return fallback;
  return raw === 'true';
}

export function getNum(key: string, fallback: number): number {
  const raw = getValue(key);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function getFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(new Date().getTimezoneOffset()),
    navigator.platform || '',
  ];
  return btoa(parts.join('|')).replace(/=/g, '');
}

export function isActivatedForThisDevice(): boolean {
  const code = getValue(KEYS.activationCode);
  const device = getValue(KEYS.deviceId);
  return !!code && !!device && device === getFingerprint();
}
