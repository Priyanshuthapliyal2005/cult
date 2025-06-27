'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, MapPin, AlertTriangle, Info, Search, Phone, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cityDatabase, type CityData } from '@/lib/cityDatabase';
import { trpc } from '@/lib/trpc';
import { useTranslations } from 'next-intl';

interface TravelLawsAssistantProps {
  selectedCity?: CityData;
  onCityChange?: (city: CityData) => void;
  className?: string;
}

export default function TravelLawsAssistant({ 
  selectedCity, 
  onCityChange, 
  className = '' 
}: TravelLawsAssistantProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [legalQuestion, setLegalQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAsking, setIsAsking] = useState(false);
  const [legalResponse, setLegalResponse] = useState<string>('');
  
  const t = useTranslations();
  const askLegalQuestion = trpc.sendMessage.useMutation();

  const handleCitySearch = (query: string) => {
    if (!query.trim()) return;
    
    const foundCity = cityDatabase.find(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      city.region.toLowerCase().includes(query.toLowerCase())
    );
    
    if (foundCity && onCityChange) {
      onCityChange(foundCity);
    }
  };

  const handleLegalQuestion = async () => {
    if (!legalQuestion.trim() || !selectedCity) return;
    
    setIsAsking(true);
    try {
      const response = await askLegalQuestion.mutateAsync({
        message: `Legal Question about ${selectedCity.name}: ${legalQuestion}`,
        location: selectedCity.name,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude
      });
      setLegalResponse(response.response);
    } catch (error) {
      setLegalResponse('I apologize, but I encountered an error processing your legal question. Please try again or contact local authorities for official legal advice.');
    } finally {
      setIsAsking(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'severe': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const commonQuestions = [
    "Can I drink alcohol in this city?",
    "What are the photography restrictions?",
    "Do I need special permits to drive here?",
    "What should I declare at customs?",
    "Are there any dress code requirements?",
    "What are the noise regulations?",
    "Can I use ride-sharing services?",
    "What happens if I'm arrested as a tourist?"
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Travel Laws & Regulations Assistant
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Understand local laws and regulations in plain English. Get clear, AI-powered guidance 
          to ensure compliant and safe travel experiences.
        </p>
      </div>

      {/* City Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Select Your Destination
          </CardTitle>
          <CardDescription>
            Choose a city to get location-specific legal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search for any city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCitySearch(searchQuery)}
              className="flex-1"
            />
            <Button onClick={() => handleCitySearch(searchQuery)}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          
          {selectedCity && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedCity.image} 
                  alt={selectedCity.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedCity.name}</h3>
                  <p className="text-gray-600">{selectedCity.region}, {selectedCity.country}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">Safety: {selectedCity.safetyRating}/10</Badge>
                    <Badge variant="outline">Tourist Friendly: {selectedCity.touristFriendly}/10</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Question Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Ask Your Legal Question
          </CardTitle>
          <CardDescription>
            Get instant answers about local laws and regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="immigration">Immigration & Customs</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="public">Public Behavior</SelectItem>
                <SelectItem value="photography">Photography & Privacy</SelectItem>
                <SelectItem value="shopping">Shopping & Taxes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            placeholder="Ask about any local law, regulation, or legal requirement..."
            value={legalQuestion}
            onChange={(e) => setLegalQuestion(e.target.value)}
            rows={3}
          />
          
          <Button 
            onClick={handleLegalQuestion}
            disabled={!legalQuestion.trim() || !selectedCity || isAsking}
            className="w-full"
          >
            {isAsking ? 'Researching Legal Information...' : 'Get Legal Guidance'}
          </Button>

          {/* Quick Questions */}
          <div>
            <p className="text-sm font-medium mb-2">Common Questions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs justify-start h-auto py-2 px-3 whitespace-normal text-left"
                  onClick={() => setLegalQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Response */}
          {legalResponse && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">Legal Guidance:</div>
                  <div className="whitespace-pre-wrap">{legalResponse}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    ⚠️ This is AI-generated guidance. For official legal advice, consult local authorities or legal professionals.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Legal Information Tabs */}
      {selectedCity?.travelLaws && (
        <Tabs defaultValue="penalties" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="penalties">Penalties</TabsTrigger>
            <TabsTrigger value="immigration">Immigration</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="photography">Photography</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="penalties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Common Violations & Penalties
                </CardTitle>
                <CardDescription>
                  Know the consequences to avoid legal troubles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCity.travelLaws.penalties.commonViolations.map((violation, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{violation.violation}</h4>
                          <p className="text-sm mt-1">{violation.penalty}</p>
                        </div>
                        <Badge variant={violation.severity === 'severe' ? 'destructive' : 
                                      violation.severity === 'moderate' ? 'secondary' : 'outline'}>
                          {violation.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="immigration" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Visa Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.immigration.visaRequirements.map((req, index) => (
                      <li key={index} className="text-sm">• {req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Entry Restrictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.immigration.entryRestrictions.map((restriction, index) => (
                      <li key={index} className="text-sm">• {restriction}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customs Regulations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.immigration.customsRegulations.map((regulation, index) => (
                      <li key={index} className="text-sm">• {regulation}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transport" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Driving Laws</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.transportation.drivingLaws.map((law, index) => (
                      <li key={index} className="text-sm">• {law}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Public Transport</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.transportation.publicTransportRules.map((rule, index) => (
                      <li key={index} className="text-sm">• {rule}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ride Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.transportation.rideSharingRegulations.map((regulation, index) => (
                      <li key={index} className="text-sm">• {regulation}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alcohol & Smoking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-xs mb-1">Alcohol Restrictions:</h4>
                      <ul className="space-y-1">
                        {selectedCity.travelLaws.publicBehavior.alcoholRestrictions.map((restriction, index) => (
                          <li key={index} className="text-xs">• {restriction}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-xs mb-1">Smoking Bans:</h4>
                      <ul className="space-y-1">
                        {selectedCity.travelLaws.publicBehavior.smokingBans.map((ban, index) => (
                          <li key={index} className="text-xs">• {ban}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Public Conduct</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-xs mb-1">Noise Ordinances:</h4>
                      <ul className="space-y-1">
                        {selectedCity.travelLaws.publicBehavior.noiseOrdinances.map((ordinance, index) => (
                          <li key={index} className="text-xs">• {ordinance}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-xs mb-1">Public Display:</h4>
                      <ul className="space-y-1">
                        {selectedCity.travelLaws.publicBehavior.publicDisplayRestrictions.map((restriction, index) => (
                          <li key={index} className="text-xs">• {restriction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="photography" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">Restricted Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.photography.restrictedAreas.map((area, index) => (
                      <li key={index} className="text-sm">• {area}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-orange-600">Permits Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.photography.permitsRequired.map((permit, index) => (
                      <li key={index} className="text-sm">• {permit}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-blue-600">Privacy Laws</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {selectedCity.travelLaws.photography.privacyLaws.map((law, index) => (
                      <li key={index} className="text-sm">• {law}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Contacts & Legal Help
                </CardTitle>
                <CardDescription>
                  Important numbers for legal emergencies and assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Emergency Services</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>Police Emergency</span>
                        <Badge variant="destructive">{selectedCity.emergencyNumbers.police}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Medical Emergency</span>
                        <Badge variant="secondary">{selectedCity.emergencyNumbers.medical}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span>Tourist Helpline</span>
                        <Badge variant="outline">{selectedCity.emergencyNumbers.tourist}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Legal Assistance</h4>
                    <div className="space-y-2">
                      {selectedCity.travelLaws.penalties.contactAuthorities.map((authority, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {authority}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Legal Rights:</strong> As a tourist, you have the right to contact your embassy 
                    if arrested. Always ask for an interpreter if needed and request to contact your 
                    country's consular services immediately.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}