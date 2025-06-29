'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, DollarSign, Users, Star, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getTripPlans, getCityById, type TripPlan, type DayPlan, type Activity } from '@/lib/cityDatabase';
import { dynamicCityService } from '@/lib/dynamicCityService';

interface TripPlannerProps {
  cityId: string;
  onPlanSelect?: (plan: TripPlan) => void;
  className?: string;
}

export default function TripPlanner({ cityId, onPlanSelect, className = '' }: TripPlannerProps) {
  const [selectedDuration, setSelectedDuration] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<TripPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [budgetType, setBudgetType] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
    
  const city = getCityById(cityId);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch trip plans
  useEffect(() => {
    async function fetchTripPlans() {
      setIsLoading(true);
      
      try {
        // Try to get plans from database first
        const plans = getTripPlans(cityId);
        
        if (plans && plans.length > 0) {
          setTripPlans(plans);
        } else {
          // If no plans in database, try to get from vector store
          const vectorPlans = await dynamicCityService.getTripPlans(cityId);
          
          if (vectorPlans && vectorPlans.plans) {
            setTripPlans(vectorPlans.plans);
          } else {
            // Fallback to empty array
            setTripPlans([]);
          }
        }
      } catch (error) {
        console.error('Error fetching trip plans:', error);
        setTripPlans([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTripPlans();
  }, [cityId]);

  useEffect(() => {
    const plan = tripPlans.find(p => p.duration === selectedDuration);
    setSelectedPlan(plan || null);
    setExpandedDay(null);
  }, [selectedDuration, tripPlans]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <div className="text-gray-600">Loading trip plans...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!city || (!isLoading && tripPlans.length === 0)) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Trip plans not available for this destination yet.</p>
          <p className="text-sm text-gray-500 mt-2">We're working on adding comprehensive trip plans!</p>
        </CardContent>
      </Card>
    );
  }

  const handleDurationSelect = (duration: 1 | 2 | 3) => {
    setSelectedDuration(duration);
  };

  const handlePlanSelect = () => {
    if (selectedPlan && onPlanSelect) {
      onPlanSelect(selectedPlan);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spiritual': return '🕉️';
      case 'cultural': return '🏛️';
      case 'adventure': return '⛰️';
      case 'food': return '🍽️';
      case 'shopping': return '🛍️';
      case 'nature': return '🌿';
      default: return '📍';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Trip Planner for {city.name}
          </CardTitle>
          <CardDescription>
            Choose your ideal trip duration and explore detailed day-by-day itineraries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duration Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Choose Trip Duration</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((days) => {
                const plan = tripPlans.find(p => p.duration === days);
                if (!plan) return null;
                
                return (
                  <motion.div
                    key={days}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedDuration === days 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleDurationSelect(days as 1 | 2 | 3)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{days}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {days === 1 ? 'Day' : 'Days'}
                        </div>
                        <div className="text-xs text-gray-500">{plan.title}</div>
                        <div className="flex items-center justify-center mt-2">
                          <Badge className={getDifficultyColor(plan.difficulty)}>
                            {plan.difficulty}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Budget Selection */}
          {selectedPlan && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Budget Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['budget', 'moderate', 'luxury'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={budgetType === type ? 'default' : 'outline'}
                    onClick={() => setBudgetType(type)}
                    className="flex flex-col h-auto py-3"
                  >
                    <DollarSign className="w-4 h-4 mb-1" />
                    <span className="capitalize text-sm">{type}</span>
                    <span className="text-xs">₹{selectedPlan.totalCost[type]}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Plan Details */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">{selectedPlan.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlan.themes.map((theme, index) => (
                      <Badge key={index} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <Calendar className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <div className="text-sm font-medium">{selectedPlan.duration} Days</div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-5 h-5 mx-auto text-green-600 mb-1" />
                      <div className="text-sm font-medium">₹{selectedPlan.totalCost[budgetType]}</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                      <div className="text-sm font-medium capitalize">{selectedPlan.difficulty}</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                      <div className="text-sm font-medium">{city.rating}/5</div>
                    </div>
                  </div>

                  {/* Day-by-Day Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Day-by-Day Itinerary</h4>
                    {selectedPlan.days.map((day, dayIndex) => (
                      <Collapsible key={dayIndex}>
                        <CollapsibleTrigger
                          className="w-full"
                          onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                        >
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {day.day}
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{day.title}</div>
                                <div className="text-sm text-gray-500">
                                  {day.activities.length} activities • ₹{day.estimatedCost} • {day.walkingDistance}km walking
                                </div>
                              </div>
                            </div>
                            {expandedDay === dayIndex ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <AnimatePresence>
                            <div className={`${expandedDay === dayIndex ? 'block' : 'hidden'} mt-3 p-4 bg-gray-50 rounded-lg`}>
                              {/* Day Highlights */}
                              <div className="mb-4">
                                <h5 className="font-medium mb-2">Day Highlights</h5>
                                <div className="flex flex-wrap gap-2">
                                  {day.highlights.map((highlight, index) => (
                                    <Badge key={index} variant="outline">
                                      {highlight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Activities Timeline */}
                              <div className="space-y-3">
                                <h5 className="font-medium">Activities Timeline</h5>
                                {day.activities.map((activity, actIndex) => (
                                  <div key={actIndex} className="flex space-x-3 p-3 bg-white rounded border">
                                    <div className="text-center shrink-0">
                                      <div className="text-sm font-bold text-blue-600">{activity.time}</div>
                                      <div className="text-xs text-gray-500">{activity.duration}min</div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                                        <h6 className="font-medium">{activity.name}</h6>
                                        <Badge variant="secondary" className="text-xs">
                                          ₹{activity.cost}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3" />
                                        <span>{activity.location}</span>
                                      </div>
                                      {activity.tips.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs font-medium text-gray-700 mb-1">Tips:</div>
                                          <ul className="text-xs text-gray-600 space-y-1">
                                            {activity.tips.map((tip, tipIndex) => (
                                              <li key={tipIndex}>• {tip}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Meals */}
                              {day.meals.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium mb-2">Recommended Meals</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {day.meals.map((meal, mealIndex) => (
                                      <div key={mealIndex} className="p-3 bg-white rounded border">
                                        <div className="font-medium text-sm capitalize">{meal.mealType}</div>
                                        <div className="text-sm text-blue-600">{meal.restaurant}</div>
                                        <div className="text-xs text-gray-500">{meal.cuisine} • ₹{meal.estimatedCost}</div>
                                        <div className="text-xs mt-1">
                                          <span className="font-medium">Must try: </span>
                                          {meal.mustTry.join(', ')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Transportation */}
                              <div className="mt-4 p-3 bg-blue-50 rounded">
                                <h5 className="font-medium text-sm mb-1">Transportation</h5>
                                <div className="text-xs text-gray-600">
                                  {day.transportation.join(' • ')}
                                </div>
                              </div>
                            </div>
                          </AnimatePresence>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>

                  {/* Action Button */}
                  {onPlanSelect && (
                    <Button onClick={handlePlanSelect} className="w-full mt-4">
                      Select This Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}