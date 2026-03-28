export interface AlphabetItem {
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

export const ACTIVATION_CODES = [
  'INTK-KID-4829',
  'INTK-KID-7314',
  'INTK-KID-9582',
  'INTK-KID-4167',
  'INTK-KID-6843',
  'INTK-KID-2975',
  'INTK-KID-8451',
] as const;

export const ALPHABET: AlphabetItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎', color: 'from-red-400 to-red-600' },
  { letter: 'B', word: 'Ball', emoji: '⚽', color: 'from-blue-400 to-blue-600' },
  { letter: 'C', word: 'Cat', emoji: '🐱', color: 'from-orange-400 to-orange-600' },
  { letter: 'D', word: 'Dog', emoji: '🐶', color: 'from-amber-500 to-orange-700' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', color: 'from-gray-400 to-gray-600' },
  { letter: 'F', word: 'Fish', emoji: '🐟', color: 'from-cyan-400 to-cyan-600' },
  { letter: 'G', word: 'Grapes', emoji: '🍇', color: 'from-purple-400 to-purple-600' },
  { letter: 'H', word: 'Hat', emoji: '🎩', color: 'from-indigo-400 to-indigo-600' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦', color: 'from-pink-300 to-pink-500' },
  { letter: 'J', word: 'Juice', emoji: '🧃', color: 'from-orange-300 to-orange-500' },
  { letter: 'K', word: 'Kite', emoji: '🪁', color: 'from-yellow-400 to-yellow-600' },
  { letter: 'L', word: 'Lion', emoji: '🦁', color: 'from-amber-500 to-yellow-700' },
  { letter: 'M', word: 'Monkey', emoji: '🐒', color: 'from-stone-500 to-stone-700' },
  { letter: 'N', word: 'Nose', emoji: '👃', color: 'from-rose-300 to-rose-500' },
  { letter: 'O', word: 'Orange', emoji: '🍊', color: 'from-orange-500 to-orange-700' },
  { letter: 'P', word: 'Panda', emoji: '🐼', color: 'from-slate-400 to-slate-600' },
  { letter: 'Q', word: 'Queen', emoji: '👸', color: 'from-fuchsia-400 to-fuchsia-600' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰', color: 'from-zinc-300 to-zinc-500' },
  { letter: 'S', word: 'Sun', emoji: '☀️', color: 'from-yellow-300 to-yellow-500' },
  { letter: 'T', word: 'Tiger', emoji: '🐯', color: 'from-orange-600 to-orange-800' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', color: 'from-violet-400 to-violet-600' },
  { letter: 'V', word: 'Van', emoji: '🚐', color: 'from-blue-300 to-blue-500' },
  { letter: 'W', word: 'Water', emoji: '💧', color: 'from-blue-500 to-blue-700' },
  { letter: 'X', word: 'Xylophone', emoji: '🎹', color: 'from-emerald-400 to-emerald-600' },
  { letter: 'Y', word: 'Yo-Yo', emoji: '🪀', color: 'from-red-500 to-red-700' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', color: 'from-neutral-400 to-neutral-600' },
];
