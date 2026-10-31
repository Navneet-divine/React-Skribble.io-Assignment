export interface CountryItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  language: string;
}

// Exactly the 10 supported DoodleSync languages
const RAW_COUNTRIES: CountryItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', language: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', language: 'हिन्दी' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', language: 'Ελληνικά' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', language: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', language: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', language: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', language: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', language: 'Português' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', language: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', language: 'Polski' },
];

// Preserves English first, then sorted A-Z by English name
export const ALL_COUNTRIES: CountryItem[] = [
  RAW_COUNTRIES[0], // English first
  ...RAW_COUNTRIES.slice(1).sort((a, b) => a.name.localeCompare(b.name)),
];
