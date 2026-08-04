export type SupportedLanguage = 'en' | 'hi' | 'es' | 'ar' | 'ja' | 'sw' | 'fr';
export type CulturalRegion = 'global' | 'south_asia' | 'latin_america' | 'mena' | 'east_asia' | 'sub_saharan_africa' | 'europe';

export interface CultureTheme {
  code: SupportedLanguage;
  region: CulturalRegion;
  displayName: string;
  nativeName: string;
  flagEmoji: string;
  isRTL: boolean;
  primaryColor: string;
  accentColor: string;
  bgClass: string;
  cardBgClass: string;
  textColor: string;
  fontClass: string;
  fontGoogleUrl: string;
  culturalMotto: string;
  landmarkImage: string;
  landmarkTitle: string;
  landmarkSource: string;
  architecturalMotif: string;
}
