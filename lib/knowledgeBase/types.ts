export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface QualityMetrics {
  dataFreshness: number;        // Days since last update
  sourceReliability: number;    // Reliability score of data sources
  userValidation: number;       // User feedback validation score
  expertReview: number;         // Expert review score
  crossReferenceAccuracy: number; // Cross-source validation score
  overallScore: number;         // Computed overall quality score
}

export interface DataSource {
  name: string;
  type: 'wikipedia' | 'osm' | 'government' | 'weather' | 'currency' | 'events' | 'user' | 'expert';
  url?: string;
  lastFetched: Date;
  reliability: number;
}

export interface UserRating {
  userId: string;
  rating: number; // 1-5
  category: 'accuracy' | 'completeness' | 'usefulness' | 'timeliness';
  comment?: string;
  timestamp: Date;
}

export interface VisaAndEntryRequirements {
  visaRequired: boolean;
  visaTypes: string[];
  maxStayDuration: number; // days
  entryRestrictions: string[];
  customsRegulations: string[];
  healthRequirements: string[];
}

export interface TransportationLaws {
  drivingLaws: string[];
  publicTransportRules: string[];
  rideSharingRegulations: string[];
  cyclingRules: string[];
  walkingRegulations: string[];
}

export interface AccommodationRegulations {
  hotelRegistration: string[];
  shortTermRentals: string[];
  guestObligations: string[];
  touristTax: string[];
}

export interface BehaviorRestrictions {
  noiseOrdinances: string[];
  alcoholRestrictions: string[];
  smokingBans: string[];
  publicDisplayRestrictions: string[];
  dressCodes: string[];
}

export interface PhotographyRules {
  restrictedAreas: string[];
  permitsRequired: string[];
  privacyLaws: string[];
  commercialRestrictions: string[];
}

export interface CommercialRegulations {
  taxRefunds: string[];
  customsDeclaration: string[];
  restrictedItems: string[];
  bargainingEtiquette: string[];
}

export interface ViolationPenalties {
  commonViolations: Array<{
    violation: string;
    penalty: string;
    severity: 'minor' | 'moderate' | 'severe';
    fineRange?: string;
    jailTime?: string;
  }>;
  contactAuthorities: string[];
  emergencyProcedures: string[];
  embassyContacts: string[];
}

export interface DressCodeGuidelines {
  general: string;
  religious: string;
  business: string;
  formal: string;
  beach: string;
}

export interface CulturalNorms {
  etiquette: string[];
  taboos: string[];
  dressCode: DressCodeGuidelines;
  religiousConsiderations: string[];
  businessCulture: string[];
  socialInteractions: string[];
  giftGiving: string[];
  diningEtiquette: string[];
}

export interface Attraction {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  description: string;
  openingHours: string;
  entryFee: string;
  culturalSignificance: string;
  tips: string[];
  photoRestrictions?: string[];
  dressRequirements?: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  coordinates: Coordinates;
  priceRange: string;
  specialties: string[];
  culturalNotes: string[];
  reservationRequired: boolean;
  dressCode?: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  type: 'festival' | 'holiday' | 'cultural' | 'religious' | 'seasonal';
  dates: string;
  description: string;
  culturalSignificance: string;
  participationGuidelines: string[];
  restrictions?: string[];
}

export interface TransportOption {
  type: string;
  description: string;
  cost: string;
  availability: string;
  culturalNotes: string[];
  legalRequirements: string[];
}

export interface EnhancedCityData {
  // Basic Information
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: Coordinates;
  
  // Core Travel Data
  population: number;
  timezone: string;
  languages: string[];
  currency: string;
  safetyRating: number;
  touristFriendly: number;
  costLevel: 'budget' | 'moderate' | 'expensive';
  bestTimeToVisit: string[];
  averageStay: number;
  
  // Legal & Regulatory System
  travelLaws: {
    immigration: VisaAndEntryRequirements;
    transportation: TransportationLaws;
    accommodation: AccommodationRegulations;
    publicBehavior: BehaviorRestrictions;
    photography: PhotographyRules;
    shopping: CommercialRegulations;
    penalties: ViolationPenalties;
  };
  
  // Cultural Intelligence
  culturalNorms: CulturalNorms;
  
  // Dynamic Content
  attractions: Attraction[];
  restaurants: Restaurant[];
  events: SeasonalEvent[];
  transportation: TransportOption[];
  
  // Economic Data
  economicData: {
    averageDailyCost: number;
    accommodationCosts: {
      budget: number;
      midRange: number;
      luxury: number;
    };
    mealCosts: {
      streetFood: number;
      restaurant: number;
      finedining: number;
    };
    transportCosts: {
      local: number;
      taxi: number;
      longDistance: number;
    };
    tippingGuide: string;
  };
  
  // Climate Data
  climate: {
    averageTemperature: Record<string, { high: number; low: number }>;
    rainySeasons: string[];
    bestWeather: string[];
    packingRecommendations: Record<string, string[]>;
  };
  
  // Language Essentials
  languageGuide: {
    primaryLanguage: string;
    essentialPhrases: Array<{
      english: string;
      local: string;
      pronunciation: string;
      usage: string;
    }>;
    communicationTips: string[];
    writingSystem: string;
  };
  
  // Quality Metrics
  metadata: {
    lastUpdated: Date;
    dataQuality: QualityMetrics;
    userFeedback: UserRating[];
    sources: DataSource[];
    updateFrequency: string;
    expertReviewed: boolean;
    communityValidated: boolean;
  };
}

export interface SearchContext {
  userLocation?: Coordinates;
  travelDates?: DateRange;
  budget?: 'budget' | 'moderate' | 'luxury';
  interests?: TravelInterest[];
  culturalPreferences?: CulturalPreference[];
  legalConcerns?: LegalConcern[];
  groupSize?: number;
  travelStyle?: 'adventure' | 'cultural' | 'relaxed' | 'business' | 'family';
}

export interface SearchFilters {
  regions?: string[];
  countries?: string[];
  safetyLevel?: number;
  languages?: string[];
  maxDistance?: number;
  costLevel?: ('budget' | 'moderate' | 'expensive')[];
  climatePreferences?: string[];
  visaFree?: boolean;
}

export interface SearchRequest {
  query: string;
  context?: SearchContext;
  filters?: SearchFilters;
  limit?: number;
  includeRecommendations?: boolean;
}

export type TravelInterest = 
  | 'adventure' | 'culture' | 'food' | 'history' | 'nature' 
  | 'nightlife' | 'shopping' | 'spiritual' | 'art' | 'music'
  | 'architecture' | 'beaches' | 'mountains' | 'urban' | 'rural';

export type CulturalPreference = 
  | 'traditional' | 'modern' | 'conservative' | 'liberal' 
  | 'religious' | 'secular' | 'multilingual' | 'english-friendly';

export type LegalConcern = 
  | 'photography' | 'alcohol' | 'dress-codes' | 'religious-sites'
  | 'driving' | 'medications' | 'customs' | 'behavior' | 'business';

export interface PersonalizedRecommendation {
  type: 'destination' | 'activity' | 'restaurant' | 'event' | 'transport';
  item: any;
  score: number;
  reasoning: string[];
  culturalNotes: string[];
  legalConsiderations: string[];
}

export interface LegalAlert {
  severity: 'info' | 'warning' | 'critical';
  category: string;
  title: string;
  description: string;
  consequences: string[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface CulturalTip {
  category: string;
  tip: string;
  importance: 'nice-to-know' | 'important' | 'essential';
  context: string;
  examples: string[];
}

export interface PracticalInformation {
  emergencyNumbers: {
    police: string;
    medical: string;
    fire: string;
    tourist: string;
  };
  businessHours: {
    general: string;
    restaurants: string;
    shops: string;
    government: string;
    banks: string;
  };
  healthAndSafety: {
    vaccinations: string[];
    commonRisks: string[];
    medicalFacilities: string[];
    pharmacies: string[];
    drinkingWater: string;
  };
  connectivity: {
    internetAvailability: string;
    wifiCommon: boolean;
    simCards: string[];
    internetCafes: boolean;
    dataRoaming: string;
  };
}

export interface TravelIntelligenceResponse {
  data: {
    destination: EnhancedCityData;
    recommendations: PersonalizedRecommendation[];
    legalAlerts: LegalAlert[];
    culturalTips: CulturalTip[];
    practicalInfo: PracticalInformation;
    similarDestinations: EnhancedCityData[];
  };
  metadata: {
    dataQuality: QualityMetrics;
    lastUpdated: Date;
    sources: DataSource[];
    confidence: number;
    searchTime: number;
  };
  status: {
    code: number;
    message: string;
    warnings?: string[];
  };
}