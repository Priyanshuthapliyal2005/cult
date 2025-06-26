export interface CulturalData {
  location: string;
  country: string;
  region: string;
  image: string;
  description: string;
  culture: string;
  highlights: string[];
  rating: number;
  latitude: number;
  longitude: number;
  insights: string;
  customs: {
    title: string;
    description: string;
    dos: string[];
    donts: string[];
  };
  laws: {
    title: string;
    important_regulations: string[];
    legal_considerations: string[];
  };
  events: {
    title: string;
    current_events: Array<{
      name: string;
      date: string;
      description: string;
    }>;
    seasonal_festivals: Array<{
      name: string;
      season: string;
      description: string;
    }>;
  };
  phrases: {
    title: string;
    essential_phrases: Array<{
      english: string;
      local: string;
      pronunciation: string;
      audio?: string;
    }>;
  };
  recommendations: {
    title: string;
    restaurants: Array<{
      name: string;
      type: string;
      description: string;
      price_range: string;
    }>;
    attractions: Array<{
      name: string;
      type: string;
      description: string;
      timing: string;
    }>;
    local_tips: string[];
  };
}

export const sampleDestinations: CulturalData[] = [
  {
    location: 'Pushkar',
    country: 'India',
    region: 'Rajasthan',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Sacred city with the famous Brahma Temple and holy Pushkar Lake',
    culture: 'Sacred & Spiritual',
    highlights: ['Brahma Temple', 'Pushkar Lake', 'Camel Fair', 'Desert Culture'],
    rating: 4.6,
    latitude: 26.4899,
    longitude: 74.5511,
    insights: 'Pushkar is one of the oldest cities in India and holds great religious significance. Respect local customs, dress modestly, and participate mindfully in spiritual activities.',
    customs: {
      title: 'Sacred City Customs & Etiquette',
      description: 'Pushkar is a holy city with strict religious customs. Visitors should respect the sacred nature of the place and follow local traditions.',
      dos: [
        'Remove shoes before entering temples',
        'Dress modestly - cover shoulders and legs',
        'Respect the vegetarian-only policy throughout the city',
        'Participate respectfully in aarti ceremonies',
        'Seek permission before photographing people',
        'Walk clockwise around the sacred lake',
        'Offer prayers with folded hands (namaste)'
      ],
      donts: [
        'Do not consume alcohol or non-vegetarian food anywhere in the city',
        'Avoid leather products near temples',
        'Do not point feet towards deities or sacred objects',
        'Avoid loud conversations near temples',
        'Do not touch temple bells or sacred objects without permission',
        'Avoid wearing revealing clothing',
        'Do not bargain aggressively with local vendors'
      ]
    },
    laws: {
      title: 'Important Regulations',
      important_regulations: [
        'Alcohol is completely banned in Pushkar',
        'Non-vegetarian food is prohibited throughout the city',
        'Photography restrictions apply in certain temple areas',
        'Respect wildlife protection laws during camel safari'
      ],
      legal_considerations: [
        'Carry valid ID for hotel check-ins',
        'Respect local noise regulations during religious hours',
        'Follow guidelines for camel fair participation',
        'Obtain proper permits for professional photography'
      ]
    },
    events: {
      title: 'Festivals & Cultural Events',
      current_events: [
        {
          name: 'Pushkar Camel Fair',
          date: 'November 2024',
          description: 'World-famous camel trading fair with cultural performances, competitions, and traditional Rajasthani celebrations'
        },
        {
          name: 'Kartik Purnima',
          date: 'November Full Moon',
          description: 'Most auspicious time to visit, with thousands of pilgrims taking holy dips in Pushkar Lake'
        },
        {
          name: 'Rose Festival',
          date: 'February-March',
          description: 'Celebration of Pushkar\'s famous rose cultivation with cultural programs and rose product exhibitions'
        }
      ],
      seasonal_festivals: [
        {
          name: 'Holi Festival',
          season: 'March',
          description: 'Festival of colors celebrated with great enthusiasm, featuring traditional music and dance'
        },
        {
          name: 'Diwali',
          season: 'October-November',
          description: 'Festival of lights with beautiful temple illuminations and community celebrations'
        },
        {
          name: 'Teej Festival',
          season: 'August',
          description: 'Monsoon festival celebrating marital bliss with traditional songs and dances'
        }
      ]
    },
    phrases: {
      title: 'Essential Hindi & Rajasthani Phrases',
      essential_phrases: [
        {
          english: 'Hello/Goodbye',
          local: 'नमस्ते (Namaste)',
          pronunciation: 'nah-mas-tay',
          audio: '/audio/namaste.mp3'
        },
        {
          english: 'Thank you',
          local: 'धन्यवाद (Dhanyawad)',
          pronunciation: 'dhan-ya-waad',
          audio: '/audio/dhanyawad.mp3'
        },
        {
          english: 'How much does this cost?',
          local: 'इसकी कीमत क्या है? (Iski keemat kya hai?)',
          pronunciation: 'is-kee kee-mat kya hai',
          audio: '/audio/price.mp3'
        },
        {
          english: 'Where is the temple?',
          local: 'मंदिर कहाँ है? (Mandir kahan hai?)',
          pronunciation: 'man-dir ka-haan hai',
          audio: '/audio/temple.mp3'
        },
        {
          english: 'Please help me',
          local: 'कृपया मेरी सहायता करें (Kripaya meri sahayata karen)',
          pronunciation: 'kri-pa-ya me-ree sa-haa-ya-ta ka-ren',
          audio: '/audio/help.mp3'
        },
        {
          english: 'Very beautiful',
          local: 'बहुत सुंदर (Bahut sundar)',
          pronunciation: 'ba-hut sun-dar',
          audio: '/audio/beautiful.mp3'
        }
      ]
    },
    recommendations: {
      title: 'Local Recommendations',
      restaurants: [
        {
          name: 'Sunset Cafe',
          type: 'Multi-cuisine Vegetarian',
          description: 'Rooftop dining with stunning lake views, famous for traditional Rajasthani thali',
          price_range: '₹200-400'
        },
        {
          name: 'Laughing Buddha Cafe',
          type: 'Continental & Indian',
          description: 'Popular backpacker spot with great coffee and international vegetarian dishes',
          price_range: '₹150-300'
        },
        {
          name: 'Pushkar Palace Restaurant',
          type: 'Traditional Rajasthani',
          description: 'Heritage hotel restaurant serving authentic royal Rajasthani cuisine',
          price_range: '₹300-600'
        },
        {
          name: 'Om Shiva Garden Restaurant',
          type: 'Indian Vegetarian',
          description: 'Garden setting with live music, specializing in North Indian vegetarian dishes',
          price_range: '₹180-350'
        }
      ],
      attractions: [
        {
          name: 'Brahma Temple',
          type: 'Religious Site',
          description: 'One of the few temples dedicated to Lord Brahma in the world, architectural marvel',
          timing: '6:00 AM - 12:00 PM, 4:00 PM - 9:00 PM'
        },
        {
          name: 'Pushkar Lake',
          type: 'Sacred Lake',
          description: 'Holy lake surrounded by 52 ghats, perfect for spiritual reflection and photography',
          timing: 'Open 24 hours'
        },
        {
          name: 'Savitri Temple',
          type: 'Hilltop Temple',
          description: 'Temple atop a hill offering panoramic views of Pushkar, accessible by ropeway or trek',
          timing: '5:00 AM - 9:00 PM'
        },
        {
          name: 'Pushkar Bazaar',
          type: 'Shopping Market',
          description: 'Vibrant market selling traditional Rajasthani handicrafts, jewelry, and textiles',
          timing: '9:00 AM - 10:00 PM'
        }
      ],
      local_tips: [
        'Visit during early morning or evening for the best temple experience',
        'Bargain respectfully in local markets - start at 30% of quoted price',
        'Try the famous Pushkar rose products and camel milk ice cream',
        'Book accommodations well in advance during Camel Fair season',
        'Carry cash as many places don\'t accept cards',
        'Respect photography restrictions in temples',
        'Stay hydrated and use sunscreen - desert climate can be harsh'
      ]
    }
  },
  {
    location: 'Rishikesh',
    country: 'India',
    region: 'Uttarakhand',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Yoga capital of the world nestled in the Himalayan foothills along the Ganges',
    culture: 'Spiritual & Adventure',
    highlights: ['Yoga Ashrams', 'River Rafting', 'Ganga Aarti', 'Beatles Ashram'],
    rating: 4.7,
    latitude: 30.0869,
    longitude: 78.2676,
    insights: 'Rishikesh combines ancient spirituality with modern adventure sports. Respect the spiritual atmosphere while enjoying outdoor activities along the sacred Ganges.',
    customs: {
      title: 'Spiritual City Customs & Etiquette',
      description: 'Rishikesh is known as the "Yoga Capital of the World" and maintains a deeply spiritual atmosphere. Visitors should respect both the religious significance and natural beauty.',
      dos: [
        'Participate respectfully in Ganga Aarti ceremonies',
        'Dress modestly, especially when visiting ashrams and temples',
        'Remove shoes before entering temples and ashrams',
        'Maintain silence during meditation sessions',
        'Respect yoga practitioners and their space',
        'Follow ashram rules and schedules if staying in one',
        'Greet with "Namaste" and folded hands'
      ],
      donts: [
        'Avoid consuming alcohol and non-vegetarian food in spiritual areas',
        'Do not disturb meditation or yoga sessions',
        'Avoid loud music or conversations near ashrams',
        'Do not litter near the Ganges or in natural areas',
        'Avoid wearing leather in temple premises',
        'Do not take photos during religious ceremonies without permission',
        'Avoid bargaining aggressively with local vendors'
      ]
    },
    laws: {
      title: 'Important Regulations',
      important_regulations: [
        'Alcohol is banned in many areas of Rishikesh',
        'River rafting requires proper safety gear and licensed operators',
        'Camping permits required for overnight stays near the river',
        'Photography restrictions in certain ashram and temple areas'
      ],
      legal_considerations: [
        'Adventure sports require signed waivers and age restrictions apply',
        'Respect environmental protection laws along the Ganges',
        'Follow guidelines for ashram stays and registrations',
        'Obtain permits for professional photography or filming'
      ]
    },
    events: {
      title: 'Spiritual & Cultural Events',
      current_events: [
        {
          name: 'International Yoga Festival',
          date: 'March 2024',
          description: 'Week-long festival featuring renowned yoga masters, workshops, and spiritual discourses from around the world'
        },
        {
          name: 'Ganga Aarti',
          date: 'Daily at sunset',
          description: 'Beautiful evening prayer ceremony at Triveni Ghat with oil lamps, chanting, and spiritual atmosphere'
        },
        {
          name: 'Kumbh Mela (Mini)',
          date: 'Every 6 years',
          description: 'Sacred gathering of pilgrims and sadhus for holy dips in the Ganges'
        }
      ],
      seasonal_festivals: [
        {
          name: 'Maha Shivratri',
          season: 'February-March',
          description: 'Major festival dedicated to Lord Shiva with night-long prayers and celebrations'
        },
        {
          name: 'Ganga Dussehra',
          season: 'May-June',
          description: 'Festival celebrating the descent of Ganges to earth with special prayers and rituals'
        },
        {
          name: 'Diwali',
          season: 'October-November',
          description: 'Festival of lights celebrated with temple illuminations and community gatherings'
        }
      ]
    },
    phrases: {
      title: 'Essential Hindi & Spiritual Phrases',
      essential_phrases: [
        {
          english: 'Peace be with you',
          local: 'शांति (Shanti)',
          pronunciation: 'shaan-ti',
          audio: '/audio/shanti.mp3'
        },
        {
          english: 'Namaste',
          local: 'नमस्ते (Namaste)',
          pronunciation: 'nah-mas-tay',
          audio: '/audio/namaste.mp3'
        },
        {
          english: 'Where is the ashram?',
          local: 'आश्रम कहाँ है? (Ashram kahan hai?)',
          pronunciation: 'aash-ram ka-haan hai',
          audio: '/audio/ashram.mp3'
        },
        {
          english: 'I want to learn yoga',
          local: 'मैं योग सीखना चाहता हूँ (Main yoga seekhna chahta hun)',
          pronunciation: 'main yo-ga seekh-na chah-ta hun',
          audio: '/audio/yoga.mp3'
        },
        {
          english: 'Thank you',
          local: 'धन्यवाद (Dhanyawad)',
          pronunciation: 'dhan-ya-waad',
          audio: '/audio/dhanyawad.mp3'
        },
        {
          english: 'Blessings',
          local: 'आशीर्वाद (Aashirwad)',
          pronunciation: 'aa-sheer-waad',
          audio: '/audio/blessings.mp3'
        }
      ]
    },
    recommendations: {
      title: 'Local Recommendations',
      restaurants: [
        {
          name: 'Chotiwala Restaurant',
          type: 'Traditional Indian Vegetarian',
          description: 'Famous family restaurant serving authentic North Indian vegetarian cuisine since 1958',
          price_range: '₹150-300'
        },
        {
          name: 'Beatles Cafe',
          type: 'Continental & Indian',
          description: 'Themed cafe near Beatles Ashram with great coffee and international vegetarian dishes',
          price_range: '₹200-400'
        },
        {
          name: 'Pyramid Cafe',
          type: 'Health Food',
          description: 'Organic and healthy food options popular among yoga practitioners and health enthusiasts',
          price_range: '₹180-350'
        },
        {
          name: 'Ganga Beach Restaurant',
          type: 'Multi-cuisine',
          description: 'Riverside dining with beautiful Ganges views and fresh, healthy vegetarian options',
          price_range: '₹250-450'
        }
      ],
      attractions: [
        {
          name: 'Laxman Jhula',
          type: 'Suspension Bridge',
          description: 'Iconic iron suspension bridge over Ganges, perfect for photography and river views',
          timing: 'Open 24 hours'
        },
        {
          name: 'Beatles Ashram (Chaurasi Kutia)',
          type: 'Historical Site',
          description: 'Abandoned ashram where The Beatles stayed in 1968, now featuring graffiti art',
          timing: '9:00 AM - 6:00 PM'
        },
        {
          name: 'Triveni Ghat',
          type: 'Sacred Ghat',
          description: 'Main ghat for Ganga Aarti ceremony, spiritual baths, and evening prayers',
          timing: 'Open 24 hours, Aarti at sunset'
        },
        {
          name: 'Neelkanth Mahadev Temple',
          type: 'Temple',
          description: 'Ancient Shiva temple in the hills, accessible by trek with beautiful mountain views',
          timing: '6:00 AM - 6:00 PM'
        }
      ],
      local_tips: [
        'Book yoga classes in advance during peak season (October-March)',
        'Carry a water bottle and stay hydrated during treks',
        'Respect ashram timings and rules if participating in programs',
        'Try river rafting with certified operators for safety',
        'Visit Ganga Aarti early to get a good spot',
        'Carry cash as many ashrams and small vendors don\'t accept cards',
        'Pack warm clothes if visiting in winter months'
      ]
    }
  },
  {
    location: 'Mussoorie',
    country: 'India',
    region: 'Uttarakhand',
    image: 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Queen of Hills - charming hill station with colonial architecture and mountain views',
    culture: 'Colonial & Mountain',
    highlights: ['Mall Road', 'Kempty Falls', 'Gun Hill', 'Colonial Architecture'],
    rating: 4.5,
    latitude: 30.4598,
    longitude: 78.0664,
    insights: 'Mussoorie retains its colonial charm with British-era architecture and hill station culture. Enjoy the cool mountain climate and respect the local Garhwali traditions.',
    customs: {
      title: 'Hill Station Customs & Etiquette',
      description: 'Mussoorie blends colonial heritage with local Garhwali culture. Visitors should respect both the historical significance and mountain community traditions.',
      dos: [
        'Dress in layers as weather can change quickly',
        'Respect local Garhwali customs and traditions',
        'Support local handicraft and woolen goods vendors',
        'Walk carefully on steep mountain paths',
        'Greet locals with "Namaste" or "Namaskar"',
        'Respect the peaceful hill station atmosphere',
        'Follow designated trekking paths'
      ],
      donts: [
        'Do not litter on mountain trails or scenic spots',
        'Avoid making loud noise in residential areas',
        'Do not venture into restricted forest areas',
        'Avoid bargaining too aggressively with local vendors',
        'Do not pick flowers or disturb wildlife',
        'Avoid smoking in public places and near forests',
        'Do not ignore weather warnings during monsoon'
      ]
    },
    laws: {
      title: 'Important Regulations',
      important_regulations: [
        'Forest areas have entry restrictions and require permits',
        'Smoking is banned in public places and forest areas',
        'Plastic bags are banned in many areas',
        'Vehicle restrictions apply on Mall Road during peak hours'
      ],
      legal_considerations: [
        'Carry valid ID for hotel registrations',
        'Follow fire safety regulations in hotels',
        'Respect wildlife protection laws in nearby national parks',
        'Obtain permits for camping in designated areas'
      ]
    },
    events: {
      title: 'Cultural Events & Festivals',
      current_events: [
        {
          name: 'Summer Festival',
          date: 'May-June',
          description: 'Annual cultural festival featuring folk dances, music performances, and local handicraft exhibitions'
        },
        {
          name: 'Autumn Festival',
          date: 'October-November',
          description: 'Celebration of harvest season with traditional Garhwali cultural programs and food festivals'
        },
        {
          name: 'Winter Carnival',
          date: 'December-January',
          description: 'Winter celebration with bonfires, cultural performances, and local cuisine festivals'
        }
      ],
      seasonal_festivals: [
        {
          name: 'Makar Sankranti',
          season: 'January',
          description: 'Kite flying festival celebrated with great enthusiasm in the hills'
        },
        {
          name: 'Holi',
          season: 'March',
          description: 'Festival of colors celebrated with traditional Garhwali folk songs and dances'
        },
        {
          name: 'Diwali',
          season: 'October-November',
          description: 'Festival of lights with beautiful hill station illuminations and community celebrations'
        }
      ]
    },
    phrases: {
      title: 'Essential Hindi & Garhwali Phrases',
      essential_phrases: [
        {
          english: 'Hello',
          local: 'नमस्कार (Namaskar)',
          pronunciation: 'na-mas-kaar',
          audio: '/audio/namaskar.mp3'
        },
        {
          english: 'How are you?',
          local: 'कैसे हैं आप? (Kaise hain aap?)',
          pronunciation: 'kai-se hain aap',
          audio: '/audio/howareyou.mp3'
        },
        {
          english: 'Where is Mall Road?',
          local: 'मॉल रोड कहाँ है? (Mall Road kahan hai?)',
          pronunciation: 'mall road ka-haan hai',
          audio: '/audio/mallroad.mp3'
        },
        {
          english: 'Very cold',
          local: 'बहुत ठंड (Bahut thand)',
          pronunciation: 'ba-hut thand',
          audio: '/audio/cold.mp3'
        },
        {
          english: 'Beautiful view',
          local: 'सुंदर दृश्य (Sundar drishya)',
          pronunciation: 'sun-dar drish-ya',
          audio: '/audio/view.mp3'
        },
        {
          english: 'Thank you',
          local: 'धन्यवाद (Dhanyawad)',
          pronunciation: 'dhan-ya-waad',
          audio: '/audio/dhanyawad.mp3'
        }
      ]
    },
    recommendations: {
      title: 'Local Recommendations',
      restaurants: [
        {
          name: 'Kalsang Friends Corner',
          type: 'Tibetan & Chinese',
          description: 'Popular restaurant serving authentic Tibetan momos and Chinese cuisine with mountain views',
          price_range: '₹200-400'
        },
        {
          name: 'Char Dukan',
          type: 'Tea & Snacks',
          description: 'Famous cluster of four tea shops serving hot tea, maggi, and pakoras with scenic views',
          price_range: '₹50-150'
        },
        {
          name: 'Urban Turban Bistro',
          type: 'Multi-cuisine',
          description: 'Rooftop restaurant with panoramic valley views serving Indian and continental dishes',
          price_range: '₹300-600'
        },
        {
          name: 'Lovely Omelette Centre',
          type: 'Continental Breakfast',
          description: 'Iconic breakfast spot famous for variety of omelettes and continental breakfast options',
          price_range: '₹150-300'
        }
      ],
      attractions: [
        {
          name: 'Mall Road',
          type: 'Shopping Street',
          description: 'Main pedestrian street with shops, cafes, and colonial architecture, perfect for evening walks',
          timing: 'Open all day, best in evening'
        },
        {
          name: 'Gun Hill',
          type: 'Viewpoint',
          description: 'Second highest peak accessible by cable car, offering panoramic Himalayan views',
          timing: '9:00 AM - 7:00 PM'
        },
        {
          name: 'Kempty Falls',
          type: 'Waterfall',
          description: 'Popular waterfall perfect for picnics and swimming, surrounded by mountains',
          timing: '8:00 AM - 6:00 PM'
        },
        {
          name: 'Camel\'s Back Road',
          type: 'Walking Trail',
          description: '3km circular walking trail offering beautiful sunrise and sunset views',
          timing: 'Best at sunrise and sunset'
        }
      ],
      local_tips: [
        'Visit during off-season (April-May, September-November) for better weather and fewer crowds',
        'Carry warm clothes even in summer as evenings can be cool',
        'Book accommodations in advance during peak season',
        'Try local Garhwali cuisine and mountain honey',
        'Use the cable car to Gun Hill for best mountain views',
        'Walk on Mall Road in the evening for the best experience',
        'Carry rain gear during monsoon season (July-September)'
      ]
    }
  }
];

export const getCulturalDataByLocation = (location: string): CulturalData | null => {
  return sampleDestinations.find(dest => 
    dest.location.toLowerCase().includes(location.toLowerCase())
  ) || null;
};

export const getAllDestinations = (): CulturalData[] => {
  return sampleDestinations;
};

// Chat responses for common queries
export const getChatResponse = (message: string, location?: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your Cultural Intelligence Assistant. I can help you discover amazing cultural insights about destinations like Pushkar, Rishikesh, and Mussoorie. What would you like to know?";
  }
  
  if (lowerMessage.includes('pushkar')) {
    return "Pushkar is a sacred city in Rajasthan! It's famous for the Brahma Temple and the holy Pushkar Lake. The city is completely vegetarian and alcohol-free. Would you like to know about the customs, festivals, or local recommendations?";
  }
  
  if (lowerMessage.includes('rishikesh')) {
    return "Rishikesh is the Yoga Capital of the World! It's perfect for spiritual seekers and adventure enthusiasts. You can experience yoga ashrams, river rafting, and the beautiful Ganga Aarti. What specific aspect interests you most?";
  }
  
  if (lowerMessage.includes('mussoorie')) {
    return "Mussoorie, the Queen of Hills, is a charming hill station with colonial architecture and stunning mountain views. Mall Road, Gun Hill, and Kempty Falls are must-visit spots. Are you planning a visit?";
  }
  
  if (lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
    return "Each destination has unique culinary experiences! Pushkar offers pure vegetarian Rajasthani cuisine, Rishikesh has healthy ashram food and international options, while Mussoorie is famous for its Tibetan momos and continental breakfast spots. Which destination's food scene interests you?";
  }
  
  if (lowerMessage.includes('festival') || lowerMessage.includes('event')) {
    return "These destinations have amazing festivals! Pushkar's Camel Fair (November), Rishikesh's International Yoga Festival (March), and Mussoorie's Summer Festival are spectacular. Each place also celebrates traditional Indian festivals with unique local flavors.";
  }
  
  if (lowerMessage.includes('language') || lowerMessage.includes('phrase')) {
    return "Hindi is widely spoken in all three destinations. Key phrases include 'Namaste' (hello), 'Dhanyawad' (thank you), and 'Kahan hai?' (where is?). In Pushkar, some Rajasthani is helpful, while in Rishikesh and Mussoorie, basic Hindi works perfectly!";
  }
  
  return "I'd be happy to help you learn about the cultural aspects of Pushkar, Rishikesh, or Mussoorie! You can ask me about local customs, festivals, food, language phrases, or recommendations for any of these beautiful destinations.";
};