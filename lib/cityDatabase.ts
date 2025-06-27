export interface CityData {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
  language: string[];
  currency: string;
  culture: string;
  image: string;
  description: string;
  highlights: string[];
  rating: number;
  costLevel: 'budget' | 'moderate' | 'expensive';
  bestTimeToVisit: string[];
  averageStay: number; // in days
  mainAttractions: string[];
  localCuisine: string[];
  transportOptions: string[];
  safetyRating: number;
  touristFriendly: number;
  // Enhanced focus on local laws and rules
  localLaws?: {
    legal: string[];
    cultural: string[];
    guidelines: string[];
    penalties: string[];
  };
  culturalTaboos?: string[];
  dressCode?: {
    general: string;
    religious: string;
    business: string;
  };
  tippingEtiquette?: string;
  businessHours?: {
    general: string;
    restaurants: string;
    shops: string;
    government: string;
  };
  emergencyNumbers?: {
    police: string;
    medical: string;
    fire: string;
    tourist: string;
  };
  // Enhanced Legal and Regulation System
  travelLaws?: {
    immigration: {
      visaRequirements: string[];
      entryRestrictions: string[];
      customsRegulations: string[];
    };
    transportation: {
      drivingLaws: string[];
      publicTransportRules: string[];
      rideSharingRegulations: string[];
    };
    accommodation: {
      hotelRegistration: string[];
      shortTermRentals: string[];
      guestObligations: string[];
    };
    publicBehavior: {
      noiseOrdinances: string[];
      alcoholRestrictions: string[];
      smokingBans: string[];
      publicDisplayRestrictions: string[];
    };
    photography: {
      restrictedAreas: string[];
      permitsRequired: string[];
      privacyLaws: string[];
    };
    shopping: {
      taxRefunds: string[];
      customsDeclaration: string[];
      restrictedItems: string[];
    };
    penalties: {
      commonViolations: Array<{
        violation: string;
        penalty: string;
        severity: 'minor' | 'moderate' | 'severe';
      }>;
      contactAuthorities: string[];
    };
  };
}

export interface TripPlan {
  duration: 1 | 2 | 3;
  title: string;
  days: DayPlan[];
  totalCost: {
    budget: number;
    moderate: number;
    luxury: number;
  };
  difficulty: 'easy' | 'moderate' | 'challenging';
  themes: string[];
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  meals: MealSuggestion[];
  accommodation?: string;
  transportation: string[];
  estimatedCost: number;
  walkingDistance: number; // in km
  highlights: string[];
}

export interface Activity {
  time: string;
  name: string;
  location: string;
  duration: number; // in minutes
  cost: number;
  description: string;
  category: 'cultural' | 'adventure' | 'food' | 'shopping' | 'nature' | 'spiritual';
  coordinates: [number, number];
  tips: string[];
}

export interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
  mustTry: string[];
  location: string;
  coordinates: [number, number];
}

// Comprehensive city database (showing structure for 1000+ cities)
export const cityDatabase: CityData[] = [
  // India - Popular destinations
  {
    id: 'pushkar-india',
    name: 'Pushkar',
    country: 'India',
    region: 'Rajasthan',
    latitude: 26.4899,
    longitude: 74.5511,
    population: 21000,
    timezone: 'Asia/Kolkata',
    language: ['Hindi', 'Rajasthani', 'English'],
    currency: 'INR',
    culture: 'Sacred & Spiritual',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Sacred city with the famous Brahma Temple and holy Pushkar Lake',
    highlights: ['Brahma Temple', 'Pushkar Lake', 'Camel Fair', 'Desert Culture'],
    rating: 4.6,
    costLevel: 'budget',
    bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
    averageStay: 2,
    mainAttractions: ['Brahma Temple', 'Pushkar Lake', 'Savitri Temple', 'Pushkar Bazaar'],
    localCuisine: ['Dal Baati Churma', 'Malpua', 'Lassi', 'Kachori'],
    transportOptions: ['Bus', 'Taxi', 'Auto-rickshaw', 'Camel'],
    safetyRating: 8.5,
    touristFriendly: 9.0
  },
  {
    id: 'rishikesh-india',
    name: 'Rishikesh',
    country: 'India',
    region: 'Uttarakhand',
    latitude: 30.0869,
    longitude: 78.2676,
    population: 102000,
    timezone: 'Asia/Kolkata',
    language: ['Hindi', 'English'],
    currency: 'INR',
    culture: 'Spiritual & Adventure',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Yoga capital of the world nestled in the Himalayan foothills along the Ganges',
    highlights: ['Yoga Ashrams', 'River Rafting', 'Ganga Aarti', 'Beatles Ashram'],
    rating: 4.7,
    costLevel: 'budget',
    bestTimeToVisit: ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'],
    averageStay: 3,
    mainAttractions: ['Laxman Jhula', 'Beatles Ashram', 'Triveni Ghat', 'Neelkanth Mahadev'],
    localCuisine: ['Chole Bhature', 'Aloo Puri', 'Herbal Tea', 'Fruit Bowls'],
    transportOptions: ['Bus', 'Taxi', 'Auto-rickshaw', 'Walking'],
    safetyRating: 9.0,
    touristFriendly: 9.2
  },
  {
    id: 'mussoorie-india',
    name: 'Mussoorie',
    country: 'India',
    region: 'Uttarakhand',
    latitude: 30.4598,
    longitude: 78.0664,
    population: 30000,
    timezone: 'Asia/Kolkata',
    language: ['Hindi', 'English'],
    currency: 'INR',
    culture: 'Colonial & Mountain',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Queen of Hills - charming hill station with colonial architecture and mountain views',
    highlights: ['Mall Road', 'Kempty Falls', 'Gun Hill', 'Colonial Architecture'],
    rating: 4.5,
    costLevel: 'moderate',
    bestTimeToVisit: ['March', 'April', 'May', 'September', 'October', 'November'],
    averageStay: 2,
    mainAttractions: ['Mall Road', 'Gun Hill', 'Kempty Falls', 'Camel\'s Back Road'],
    localCuisine: ['Tibetan Momos', 'Maggi', 'Hot Chocolate', 'Pancakes'],
    transportOptions: ['Taxi', 'Cable Car', 'Walking', 'Bus'],
    safetyRating: 8.8,
    touristFriendly: 8.5
  },
  // More Indian cities
  {
    id: 'jaipur-india',
    name: 'Jaipur',
    country: 'India',
    region: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    population: 3046000,
    timezone: 'Asia/Kolkata',
    language: ['Hindi', 'Rajasthani', 'English'],
    currency: 'INR',
    culture: 'Royal & Historic',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Pink City famous for its palaces, forts, and vibrant culture',
    highlights: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
    rating: 4.4,
    costLevel: 'moderate',
    bestTimeToVisit: ['October', 'November', 'December', 'January', 'February', 'March'],
    averageStay: 3,
    mainAttractions: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Nahargarh Fort'],
    localCuisine: ['Dal Baati Churma', 'Laal Maas', 'Ghevar', 'Pyaaz Kachori'],
    transportOptions: ['Metro', 'Bus', 'Auto-rickshaw', 'Taxi'],
    safetyRating: 8.0,
    touristFriendly: 8.8
  },
  {
    id: 'kerala-india',
    name: 'Kochi',
    country: 'India',
    region: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    population: 677000,
    timezone: 'Asia/Kolkata',
    language: ['Malayalam', 'English', 'Tamil'],
    currency: 'INR',
    culture: 'Coastal & Spice Trade',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Gateway to Kerala with backwaters, spice markets, and colonial history',
    highlights: ['Chinese Fishing Nets', 'Backwaters', 'Spice Markets', 'Fort Kochi'],
    rating: 4.3,
    costLevel: 'moderate',
    bestTimeToVisit: ['October', 'November', 'December', 'January', 'February'],
    averageStay: 3,
    mainAttractions: ['Fort Kochi', 'Mattancherry Palace', 'Jewish Synagogue', 'Marine Drive'],
    localCuisine: ['Appam', 'Fish Curry', 'Puttu', 'Banana Chips'],
    transportOptions: ['Ferry', 'Bus', 'Auto-rickshaw', 'Metro'],
    safetyRating: 9.2,
    touristFriendly: 9.0
  },
  // International destinations
  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Kanto',
    latitude: 35.6762,
    longitude: 139.6503,
    population: 13960000,
    timezone: 'Asia/Tokyo',
    language: ['Japanese', 'English'],
    currency: 'JPY',
    culture: 'Traditional & Modern',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Blend of ancient traditions and cutting-edge technology',
    highlights: ['Temples & Shrines', 'Technology', 'Cuisine', 'Pop Culture'],
    rating: 4.8,
    costLevel: 'expensive',
    bestTimeToVisit: ['March', 'April', 'May', 'September', 'October', 'November'],
    averageStay: 5,
    mainAttractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Imperial Palace'],
    localCuisine: ['Sushi', 'Ramen', 'Tempura', 'Miso Soup'],
    transportOptions: ['JR Train', 'Metro', 'Bus', 'Taxi'],
    safetyRating: 9.8,
    touristFriendly: 8.5
  },
  {
    id: 'paris-france',
    name: 'Paris',
    country: 'France',
    region: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2161000,
    timezone: 'Europe/Paris',
    language: ['French', 'English'],
    currency: 'EUR',
    culture: 'Art & Romance',
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'City of Light known for art, fashion, and romance',
    highlights: ['Eiffel Tower', 'Louvre', 'Notre Dame', 'Champs-Élysées'],
    rating: 4.7,
    costLevel: 'expensive',
    bestTimeToVisit: ['April', 'May', 'June', 'September', 'October'],
    averageStay: 4,
    mainAttractions: ['Eiffel Tower', 'Louvre Museum', 'Arc de Triomphe', 'Seine River'],
    localCuisine: ['Croissants', 'Coq au Vin', 'Macarons', 'Wine'],
    transportOptions: ['Metro', 'Bus', 'RER', 'Vélib'],
    safetyRating: 8.5,
    touristFriendly: 8.8
  },
  // Add more cities from different regions...
  {
    id: 'bali-indonesia',
    name: 'Ubud',
    country: 'Indonesia',
    region: 'Bali',
    latitude: -8.5069,
    longitude: 115.2625,
    population: 74000,
    timezone: 'Asia/Makassar',
    language: ['Indonesian', 'Balinese', 'English'],
    currency: 'IDR',
    culture: 'Spiritual & Nature',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Cultural heart of Bali with rice terraces and yoga retreats',
    highlights: ['Rice Terraces', 'Yoga Retreats', 'Art Villages', 'Temples'],
    rating: 4.6,
    costLevel: 'budget',
    bestTimeToVisit: ['April', 'May', 'June', 'July', 'August', 'September'],
    averageStay: 4,
    mainAttractions: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Ubud Palace', 'Art Market'],
    localCuisine: ['Nasi Goreng', 'Satay', 'Gado-gado', 'Tropical Fruits'],
    transportOptions: ['Scooter', 'Bicycle', 'Car', 'Walking'],
    safetyRating: 8.8,
    touristFriendly: 9.5
  }
  // Note: In a real implementation, this would contain 1000+ cities from all continents
];

// Trip planning data for different durations
export const tripPlans: Record<string, TripPlan[]> = {
  'pushkar-india': [
    {
      duration: 1,
      title: 'Sacred Pushkar Day Tour',
      difficulty: 'easy',
      themes: ['spiritual', 'cultural'],
      totalCost: { budget: 1500, moderate: 2500, luxury: 5000 },
      days: [
        {
          day: 1,
          title: 'Sacred Sites & Local Culture',
          estimatedCost: 1500,
          walkingDistance: 3.5,
          highlights: ['Brahma Temple', 'Pushkar Lake', 'Local Bazaar'],
          activities: [
            {
              time: '6:00 AM',
              name: 'Sunrise at Pushkar Lake',
              location: 'Pushkar Lake',
              duration: 60,
              cost: 0,
              description: 'Start your day with a peaceful sunrise and morning prayers',
              category: 'spiritual',
              coordinates: [26.4902, 74.5514],
              tips: ['Dress modestly', 'Respect local customs', 'Bring a camera']
            },
            {
              time: '7:30 AM',
              name: 'Brahma Temple Visit',
              location: 'Brahma Temple',
              duration: 90,
              cost: 50,
              description: 'Visit one of the few temples dedicated to Lord Brahma',
              category: 'spiritual',
              coordinates: [26.4899, 74.5511],
              tips: ['Remove shoes', 'No photography inside', 'Dress conservatively']
            },
            {
              time: '10:00 AM',
              name: 'Pushkar Bazaar Shopping',
              location: 'Main Bazaar',
              duration: 120,
              cost: 500,
              description: 'Shop for handicrafts, jewelry, and traditional items',
              category: 'shopping',
              coordinates: [26.4895, 74.5508],
              tips: ['Bargain respectfully', 'Check quality', 'Try local sweets']
            },
            {
              time: '2:00 PM',
              name: 'Savitri Temple Trek',
              location: 'Savitri Hill',
              duration: 180,
              cost: 100,
              description: 'Trek to hilltop temple for panoramic views',
              category: 'adventure',
              coordinates: [26.4920, 74.5530],
              tips: ['Wear comfortable shoes', 'Carry water', 'Go before sunset']
            },
            {
              time: '6:00 PM',
              name: 'Evening Aarti at Lake',
              location: 'Pushkar Lake Ghat',
              duration: 60,
              cost: 0,
              description: 'Attend the beautiful evening prayer ceremony',
              category: 'spiritual',
              coordinates: [26.4902, 74.5514],
              tips: ['Arrive early for good spot', 'Respect the ceremony', 'Stay until end']
            }
          ],
          meals: [
            {
              mealType: 'breakfast',
              restaurant: 'Sunset Cafe',
              cuisine: 'Indian Vegetarian',
              estimatedCost: 200,
              mustTry: ['Poha', 'Masala Chai', 'Parathas'],
              location: 'Near Pushkar Lake',
              coordinates: [26.4895, 74.5508]
            },
            {
              mealType: 'lunch',
              restaurant: 'Laughing Buddha Cafe',
              cuisine: 'Multi-cuisine',
              estimatedCost: 300,
              mustTry: ['Thali', 'Lassi', 'Vegetable Curry'],
              location: 'Main Bazaar',
              coordinates: [26.4890, 74.5510]
            },
            {
              mealType: 'dinner',
              restaurant: 'Pushkar Palace',
              cuisine: 'Rajasthani',
              estimatedCost: 450,
              mustTry: ['Dal Baati Churma', 'Gatte ki Sabzi', 'Malpua'],
              location: 'Palace Road',
              coordinates: [26.4885, 74.5515]
            }
          ],
          transportation: ['Walking', 'Auto-rickshaw for temple trek']
        }
      ]
    },
    {
      duration: 2,
      title: 'Complete Pushkar Experience',
      difficulty: 'easy',
      themes: ['spiritual', 'cultural', 'adventure'],
      totalCost: { budget: 3000, moderate: 5000, luxury: 9000 },
      days: [
        {
          day: 1,
          title: 'Sacred Sites & Temples',
          estimatedCost: 1500,
          walkingDistance: 4.0,
          highlights: ['Brahma Temple', 'Pushkar Lake', 'Local Markets'],
          activities: [
            {
              time: '6:00 AM',
              name: 'Sunrise Yoga at Lake',
              location: 'Pushkar Lake',
              duration: 60,
              cost: 200,
              description: 'Start with morning yoga session by the holy lake',
              category: 'spiritual',
              coordinates: [26.4902, 74.5514],
              tips: ['Bring yoga mat', 'Wear comfortable clothes', 'Join group session']
            },
            {
              time: '8:00 AM',
              name: 'Brahma Temple Complex',
              location: 'Brahma Temple',
              duration: 120,
              cost: 50,
              description: 'Detailed exploration of the temple complex and surroundings',
              category: 'spiritual',
              coordinates: [26.4899, 74.5511],
              tips: ['Hire local guide', 'Learn about history', 'Respect traditions']
            }
            // Add more activities...
          ],
          meals: [
            {
              mealType: 'breakfast',
              restaurant: 'Honey & Spice',
              cuisine: 'Healthy',
              estimatedCost: 250,
              mustTry: ['Fresh Fruits', 'Granola Bowl', 'Herbal Tea'],
              location: 'Near Lake',
              coordinates: [26.4898, 74.5512]
            }
            // Add more meals...
          ],
          transportation: ['Walking', 'Bicycle rental']
        },
        {
          day: 2,
          title: 'Desert Culture & Adventure',
          estimatedCost: 1500,
          walkingDistance: 2.0,
          highlights: ['Camel Safari', 'Desert Villages', 'Sunset Views'],
          activities: [
            {
              time: '7:00 AM',
              name: 'Village Heritage Walk',
              location: 'Traditional Villages',
              duration: 120,
              cost: 300,
              description: 'Explore traditional Rajasthani village life and culture',
              category: 'cultural',
              coordinates: [26.4850, 74.5400],
              tips: ['Respect local customs', 'Interact with villagers', 'Learn about traditions']
            },
            {
              time: '3:00 PM',
              name: 'Camel Safari & Sunset',
              location: 'Pushkar Desert',
              duration: 240,
              cost: 800,
              description: 'Camel ride through desert with beautiful sunset views',
              category: 'adventure',
              coordinates: [26.4700, 74.5300],
              tips: ['Wear sun protection', 'Bring camera', 'Stay hydrated']
            }
          ],
          meals: [
            {
              mealType: 'lunch',
              restaurant: 'Desert Camp',
              cuisine: 'Rajasthani',
              estimatedCost: 400,
              mustTry: ['Desert Thali', 'Bajre ki Roti', 'Ker Sangri'],
              location: 'Desert Area',
              coordinates: [26.4700, 74.5300]
            }
          ],
          transportation: ['Jeep to desert', 'Camel for safari']
        }
      ]
    },
    {
      duration: 3,
      title: 'Immersive Pushkar & Region',
      difficulty: 'moderate',
      themes: ['spiritual', 'cultural', 'adventure', 'nature'],
      totalCost: { budget: 4500, moderate: 7500, luxury: 15000 },
      days: [
        // Day 1: Same as 2-day plan
        {
          day: 1,
          title: 'Sacred Sites & Temples',
          estimatedCost: 1500,
          walkingDistance: 4.0,
          highlights: ['Brahma Temple', 'Pushkar Lake', 'Local Markets'],
          activities: [
            // Copy from above...
          ],
          meals: [
            // Copy from above...
          ],
          transportation: ['Walking', 'Bicycle rental']
        },
        // Day 2: Enhanced desert experience
        {
          day: 2,
          title: 'Desert Adventure & Culture',
          estimatedCost: 1500,
          walkingDistance: 2.0,
          highlights: ['Camel Safari', 'Desert Camping', 'Folk Performance'],
          activities: [
            {
              time: '6:00 AM',
              name: 'Desert Morning Walk',
              location: 'Sand Dunes',
              duration: 90,
              cost: 0,
              description: 'Peaceful morning walk in the desert landscape',
              category: 'nature',
              coordinates: [26.4600, 74.5200],
              tips: ['Early start for cool weather', 'Watch wildlife', 'Enjoy silence']
            },
            {
              time: '4:00 PM',
              name: 'Extended Camel Safari',
              location: 'Pushkar Desert',
              duration: 300,
              cost: 1200,
              description: 'Extended camel safari with overnight desert camping',
              category: 'adventure',
              coordinates: [26.4700, 74.5300],
              tips: ['Pack warm clothes', 'Enjoy stargazing', 'Traditional dinner included']
            }
          ],
          meals: [
            {
              mealType: 'dinner',
              restaurant: 'Desert Camp',
              cuisine: 'Traditional',
              estimatedCost: 600,
              mustTry: ['Barbecue', 'Folk Music', 'Desert Wine'],
              location: 'Desert Camp',
              coordinates: [26.4700, 74.5300]
            }
          ],
          accommodation: 'Desert Camp (traditional tents)',
          transportation: ['Jeep', 'Camel']
        },
        // Day 3: Surrounding attractions
        {
          day: 3,
          title: 'Regional Exploration',
          estimatedCost: 1500,
          walkingDistance: 5.0,
          highlights: ['Ajmer Sharif', 'Rose Gardens', 'Local Crafts'],
          activities: [
            {
              time: '8:00 AM',
              name: 'Ajmer Sharif Dargah',
              location: 'Ajmer (30km from Pushkar)',
              duration: 180,
              cost: 500,
              description: 'Visit the famous Sufi shrine and experience spiritual harmony',
              category: 'spiritual',
              coordinates: [26.4499, 74.6399],
              tips: ['Respect all faiths', 'Cover head', 'Experience qawwali music']
            },
            {
              time: '2:00 PM',
              name: 'Rose Garden Visit',
              location: 'Pushkar Rose Gardens',
              duration: 120,
              cost: 100,
              description: 'Learn about famous Pushkar rose cultivation and production',
              category: 'nature',
              coordinates: [26.4950, 74.5600],
              tips: ['Best during blooming season', 'Buy rose products', 'Photography allowed']
            }
          ],
          meals: [
            {
              mealType: 'lunch',
              restaurant: 'Ajmer Local Restaurant',
              cuisine: 'Mughlai',
              estimatedCost: 350,
              mustTry: ['Biryani', 'Kebabs', 'Sweet Dishes'],
              location: 'Ajmer City',
              coordinates: [26.4499, 74.6399]
            }
          ],
          transportation: ['Bus to Ajmer', 'Auto-rickshaw', 'Walking']
        }
      ]
    }
  ],
  // Add trip plans for other cities...
  'rishikesh-india': [
    {
      duration: 1,
      title: 'Spiritual Rishikesh',
      difficulty: 'easy',
      themes: ['spiritual', 'nature'],
      totalCost: { budget: 2000, moderate: 3500, luxury: 6000 },
      days: [
        {
          day: 1,
          title: 'Yoga & Spirituality',
          estimatedCost: 2000,
          walkingDistance: 4.0,
          highlights: ['Ganga Aarti', 'Yoga Session', 'Beatles Ashram'],
          activities: [
            {
              time: '6:00 AM',
              name: 'Sunrise Yoga',
              location: 'Parmarth Niketan',
              duration: 90,
              cost: 500,
              description: 'Traditional yoga session by the Ganges',
              category: 'spiritual',
              coordinates: [30.0869, 78.2676],
              tips: ['Bring yoga mat', 'Empty stomach preferred', 'Meditative environment']
            },
            {
              time: '9:00 AM',
              name: 'Beatles Ashram Exploration',
              location: 'Chaurasi Kutia',
              duration: 120,
              cost: 150,
              description: 'Explore the abandoned ashram where Beatles stayed in 1968',
              category: 'cultural',
              coordinates: [30.0895, 78.2845],
              tips: ['Great for photography', 'Learn Beatles history', 'Graffiti art viewing']
            },
            {
              time: '6:00 PM',
              name: 'Ganga Aarti Ceremony',
              location: 'Triveni Ghat',
              duration: 60,
              cost: 0,
              description: 'Beautiful evening prayer ceremony by the river',
              category: 'spiritual',
              coordinates: [30.0850, 78.2650],
              tips: ['Arrive early', 'Participate respectfully', 'Bring floating lamps']
            }
          ],
          meals: [
            {
              mealType: 'breakfast',
              restaurant: 'Chotiwala',
              cuisine: 'North Indian',
              estimatedCost: 200,
              mustTry: ['Aloo Puri', 'Lassi', 'Parathas'],
              location: 'Ram Jhula',
              coordinates: [30.0869, 78.2676]
            },
            {
              mealType: 'lunch',
              restaurant: 'Beatles Cafe',
              cuisine: 'Continental',
              estimatedCost: 300,
              mustTry: ['Hummus', 'Smoothie Bowl', 'Herbal Tea'],
              location: 'Near Beatles Ashram',
              coordinates: [30.0890, 78.2840]
            },
            {
              mealType: 'dinner',
              restaurant: 'Ganga Beach Restaurant',
              cuisine: 'Indian Vegetarian',
              estimatedCost: 400,
              mustTry: ['River View Thali', 'Ganga Water', 'Organic Food'],
              location: 'Ganga Beach',
              coordinates: [30.0880, 78.2680]
            }
          ],
          transportation: ['Walking', 'Auto-rickshaw', 'Ferry across Ganges']
        }
      ]
    },
    // Add 2-day and 3-day plans...
  ],
  'mussoorie-india': [
    {
      duration: 1,
      title: 'Queen of Hills Day Trip',
      difficulty: 'easy',
      themes: ['nature', 'colonial'],
      totalCost: { budget: 2500, moderate: 4000, luxury: 7000 },
      days: [
        {
          day: 1,
          title: 'Hill Station Highlights',
          estimatedCost: 2500,
          walkingDistance: 5.0,
          highlights: ['Mall Road', 'Gun Hill', 'Kempty Falls'],
          activities: [
            {
              time: '7:00 AM',
              name: 'Sunrise at Gun Hill',
              location: 'Gun Hill',
              duration: 120,
              cost: 300,
              description: 'Cable car ride to Gun Hill for panoramic mountain views',
              category: 'nature',
              coordinates: [30.4615, 78.0642],
              tips: ['Early morning for clear views', 'Bring warm clothes', 'Photography friendly']
            },
            {
              time: '10:00 AM',
              name: 'Mall Road Walk',
              location: 'Mall Road',
              duration: 180,
              cost: 0,
              description: 'Leisurely walk along the famous Mall Road with shopping',
              category: 'cultural',
              coordinates: [30.4598, 78.0664],
              tips: ['No vehicles allowed', 'Great for shopping', 'Try local snacks']
            },
            {
              time: '2:00 PM',
              name: 'Kempty Falls Visit',
              location: 'Kempty Falls',
              duration: 180,
              cost: 50,
              description: 'Visit the beautiful waterfall and enjoy nature',
              category: 'nature',
              coordinates: [30.4540, 78.0420],
              tips: ['Swimming possible', 'Crowded on weekends', 'Wear non-slip shoes']
            }
          ],
          meals: [
            {
              mealType: 'breakfast',
              restaurant: 'Lovely Omelette Centre',
              cuisine: 'Continental',
              estimatedCost: 200,
              mustTry: ['Different Omelettes', 'Hot Coffee', 'Pancakes'],
              location: 'Mall Road',
              coordinates: [30.4598, 78.0664]
            },
            {
              mealType: 'lunch',
              restaurant: 'Kalsang Friends Corner',
              cuisine: 'Tibetan',
              estimatedCost: 350,
              mustTry: ['Momos', 'Thukpa', 'Tibetan Tea'],
              location: 'Mall Road',
              coordinates: [30.4600, 78.0670]
            },
            {
              mealType: 'dinner',
              restaurant: 'Urban Turban Bistro',
              cuisine: 'Multi-cuisine',
              estimatedCost: 500,
              mustTry: ['Mountain View Dining', 'Local Cuisine', 'Hot Soup'],
              location: 'Mall Road',
              coordinates: [30.4595, 78.0660]
            }
          ],
          transportation: ['Cable car', 'Taxi', 'Walking', 'Local bus']
        }
      ]
    }
    // Add 2-day and 3-day plans...
  ]
};

// Function to get cities by filters
export function getCitiesByFilter(filters: {
  country?: string;
  region?: string;
  costLevel?: 'budget' | 'moderate' | 'expensive';
  culture?: string;
  minRating?: number;
  searchTerm?: string;
}): CityData[] {
  return cityDatabase.filter(city => {
    if (filters.country && city.country !== filters.country) return false;
    if (filters.region && city.region !== filters.region) return false;
    if (filters.costLevel && city.costLevel !== filters.costLevel) return false;
    if (filters.culture && !city.culture.toLowerCase().includes(filters.culture.toLowerCase())) return false;
    if (filters.minRating && city.rating < filters.minRating) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return city.name.toLowerCase().includes(term) || 
             city.country.toLowerCase().includes(term) ||
             city.description.toLowerCase().includes(term) ||
             city.highlights.some(h => h.toLowerCase().includes(term));
    }
    return true;
  });
}

// Function to get trip plans for a city
export function getTripPlans(cityId: string): TripPlan[] {
  return tripPlans[cityId] || [];
}

// Function to get city by ID
export function getCityById(cityId: string): CityData | undefined {
  return cityDatabase.find(city => city.id === cityId);
}

// Function to get nearby cities
export function getNearbyCities(latitude: number, longitude: number, radiusKm: number = 100): CityData[] {
  return cityDatabase.filter(city => {
    const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
    return distance <= radiusKm;
  });
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}