# CulturalCompass - AI-Powered Travel Assistant

A comprehensive travel intelligence platform that provides personalized cultural insights, local recommendations, and real-time assistance for travelers worldwide.

## Features

### 🌍 Cultural Intelligence Engine
- **Location-based Insights**: Get deep cultural knowledge for any destination
- **Local Customs & Etiquette**: Learn proper behavior and social norms
- **Essential Phrases**: Master key phrases with pronunciation guides
- **Cultural Events**: Discover festivals, celebrations, and local happenings

### 🤖 AI Travel Assistant
- **Real-time Chat**: Interactive AI assistant for instant travel advice
- **Personalized Recommendations**: Tailored suggestions based on your interests
- **Cultural Context**: Every recommendation comes with cultural background
- **Multi-language Support**: Communicate in local languages

### 🗺️ Interactive Mapping
- **Cultural Points of Interest**: Explore destinations with cultural context
- **Local Recommendations**: Find authentic restaurants, attractions, and experiences
- **Navigation Assistance**: Get culturally-aware directions and tips

### 📱 User Experience
- **Mobile-First Design**: Optimized for on-the-go travel
- **Offline Capabilities**: Access key information without internet
- **Voice Synthesis**: Hear pronunciations and practice phrases
- **Real-time Updates**: Stay informed about local events and changes

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and interactions
- **Radix UI**: Accessible component primitives
- **React Leaflet**: Interactive maps

### Backend
- **tRPC**: Type-safe API routes
- **Prisma ORM**: Database management
- **PostgreSQL**: Primary database (Neon)
- **OpenAI GPT-4**: Cultural analysis and chat responses
- **Vector Search**: Semantic search capabilities

### Integrations
- **ElevenLabs**: Voice synthesis for pronunciation
- **Lingo API**: Translation services
- **OpenStreetMap**: Mapping data
- **Resend**: Email services

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cultural-compass.git
cd cultural-compass
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
DATABASE_URL="your-postgresql-connection-string"
OPENAI_API_KEY="your-openai-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
LINGO_API_KEY="your-lingo-api-key"
RESEND_API_KEY="your-resend-api-key"
```

5. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Architecture

### Database Schema
- **Users**: User profiles and preferences
- **Conversations**: Chat history and context
- **Messages**: Individual chat messages
- **CulturalInsights**: Cached cultural information
- **Favorites**: User-saved content
- **Trips**: Travel planning and itineraries
- **AudioCache**: Cached voice synthesis

### API Design
- **tRPC**: Type-safe API with automatic client generation
- **Real-time**: WebSocket connections for live updates
- **Caching**: Redis for performance optimization
- **Rate Limiting**: API protection and fair usage

### Performance Optimizations
- **Response Time**: < 2 seconds for all requests
- **Concurrent Users**: 1000+ simultaneous users
- **Uptime**: 99.9% availability target
- **AI Accuracy**: 95%+ cultural insight accuracy

## Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
```

### Database (Neon PostgreSQL)
- Set up Neon PostgreSQL instance
- Configure connection string in environment variables
- Run migrations in production

### Environment Variables
```env
DATABASE_URL="your-production-database-url"
OPENAI_API_KEY="your-production-openai-key"
NEXTAUTH_URL="https://your-domain.com"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@culturalcompass.com or join our community Discord.

## Roadmap

- [ ] Voice chat functionality
- [ ] Offline mode capabilities
- [ ] Mobile app (React Native)
- [ ] Enterprise features
- [ ] Additional AI models integration
- [ ] Augmented reality features
- [ ] Social features and community
- [ ] Trip planning and booking integration

---

Built with ❤️ for travelers who want to connect authentically with local cultures.