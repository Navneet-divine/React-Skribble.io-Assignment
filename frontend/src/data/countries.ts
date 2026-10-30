export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  language: string;
}

const RAW_COUNTRIES: CountryItem[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', language: 'Spanish' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', language: 'English' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', language: 'German' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', language: 'Bengali' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', language: 'Dutch / French' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', language: 'Portuguese' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', language: 'English / French' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', language: 'Spanish' },
  { code: 'CN', name: 'China', flag: '🇨🇳', language: 'Mandarin' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', language: 'Spanish' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', language: 'Croatian' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', language: 'Czech' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', language: 'Danish' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', language: 'Arabic' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', language: 'Finnish' },
  { code: 'FR', name: 'France', flag: '🇫🇷', language: 'French' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', language: 'German' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', language: 'Greek' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', language: 'Hungarian' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', language: 'Icelandic' },
  { code: 'IN', name: 'India', flag: '🇮🇳', language: 'English / Hindi' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', language: 'Indonesian' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', language: 'English' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', language: 'Hebrew' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', language: 'Italian' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', language: 'Japanese' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', language: 'English' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', language: 'Malay / English' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', language: 'Spanish' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', language: 'Dutch' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', language: 'English' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', language: 'English' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', language: 'Norwegian' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', language: 'English / Urdu' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', language: 'Spanish' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', language: 'English / Filipino' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', language: 'Polish' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', language: 'Portuguese' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', language: 'Romanian' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', language: 'Arabic' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', language: 'English' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', language: 'English' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', language: 'Korean' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', language: 'Spanish' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', language: 'Swedish' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', language: 'German / French' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', language: 'Thai' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', language: 'Turkish' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', language: 'Ukrainian' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', language: 'Arabic / English' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', language: 'English' },
  { code: 'US', name: 'United States', flag: '🇺🇸', language: 'English' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', language: 'Vietnamese' },
];

// Guaranteed sorted A-Z
export const ALL_COUNTRIES: CountryItem[] = [...RAW_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name)
);
