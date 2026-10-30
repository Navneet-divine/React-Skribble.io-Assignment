export const DEFAULT_WORDS = [
  'apple', 'banana', 'orange', 'guitar', 'piano', 'violin', 'pizza', 'burger',
  'cookie', 'coffee', 'laptop', 'camera', 'rocket', 'bicycle', 'airplane', 'subway',
  'castle', 'bridge', 'mountain', 'rainbow', 'volcano', 'island', 'cactus', 'flower',
  'elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'butterfly', 'octopus', 'spider',
  'diamond', 'helmet', 'umbrella', 'sunglasses', 'backpack', 'flashlight', 'telescope', 'compass',
  'campfire', 'waterfall', 'pyramid', 'lighthouse', 'skyscraper', 'windmill', 'submarine', 'helicopter',
  'astronaut', 'superhero', 'detective', 'wizard', 'dinosaur', 'robot', 'monster', 'alien',
  'sandwich', 'pancake', 'ice cream', 'cupcake', 'popcorn', 'lollipop', 'doughnut', 'strawberry',
  'football', 'basketball', 'tennis', 'baseball', 'skateboard', 'snowboard', 'surfboard', 'rollercoaster',
  'candle', 'clock', 'mirror', 'trophy', 'ladder', 'anchor', 'magnet', 'battery',
  'puzzle', 'dice', 'balloon', 'kite', 'swing', 'trampoline', 'treasure', 'feather'
];

/**
 * Returns 3 random distinct word choices for the drawer.
 * If the room host supplied custom words, mixes or exclusively uses them based on settings.
 */
export function getThreeWordChoices(customWords: string[] = [], onlyCustom: boolean = false): string[] {
  let pool = DEFAULT_WORDS;

  if (customWords.length > 0) {
    const cleanedCustom = customWords.map(w => w.trim().toLowerCase()).filter(Boolean);
    if (onlyCustom && cleanedCustom.length >= 3) {
      pool = cleanedCustom;
    } else if (cleanedCustom.length > 0) {
      pool = Array.from(new Set([...DEFAULT_WORDS, ...cleanedCustom]));
    }
  }

  // Shuffle and pick 3 unique words
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}
