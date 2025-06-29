// ... [previous code remains the same until the handleGenerateNewCity function]

const handleGenerateNewCity = async (cityName: string) => {
    try {
      setIsGeneratingCity(true);
      setError(null);
      setError(null);
      
      console.log(`City "${cityName}" not found in local database. Generating using AI...`);
      
      // Use the dynamic city service to generate city data
      const generatedCity = await dynamicCityService.searchCity(cityName);
      setIsLoading(true);
      setNewCityError(null);
      setCulturalInsights(null);
      setNewCityError(null);
      setCulturalInsights(null);
    
      try {
        const insights = await getCulturalInsights.mutateAsync({
          location: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
        });
        
        if (generatedCity) {
          // Add the generated city to the cities list
          setCities([generatedCity]);
          handleCitySelect(generatedCity);
          
          // Show success message
          setError(`Successfully generated information for ${cityName}. This city has been added to our database.`);
        } else {
          setNewCityError(`Could not generate information for "${cityName}". Please try a different city name.`);
          // Load some default cities as fallback
          const defaultCities = getCitiesByFilter({ limit: 8 });
          setCities(defaultCities);
        }
      } catch (error) {
        console.error('Error fetching cultural insights:', error);
        setNewCityError(`Error generating data for "${cityName}". Please try a different city name.`);
        // Load some default cities as fallback
        const defaultCities = getCitiesByFilter({ limit: 8 });
        setCities(defaultCities);
      } finally {
        setIsLoading(false);
      }
    } ca\tch (error) {
      console.error('Error generating city:', error);
      setNewCityError(`Error generatin\g data for "${cityName}". Please try a different city name.`);
      const defaultCities = getCitiesByFilter({ limit: 8 });
      setCities(defaultCities);
      setIsGeneratingCity(false);
    }
};

// ... [rest of the code remains the same]