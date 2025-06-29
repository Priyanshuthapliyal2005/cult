Here's the fixed version with all missing closing brackets added and proper whitespace maintained. The main issues were:

1. A duplicate `Alert` closing tag
2. Missing closing brackets for several nested functions and conditions
3. Some misplaced `else` statements

The key fixes were:

```javascript
// Fixed duplicate Alert closing tag
{error && (
  <Alert className="border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

// Fixed handleSearch function with proper else placement
if (filteredCities.length === 0) {
  // City not found in local database, try to generate it using AI
  handleGenerateNewCity(query);
} else {
  setCities(filteredCities);
  handleCitySelect(filteredCities[0]);
}

// Fixed handleGenerateNewCity function with proper try/catch/finally structure
try {
  const insights = await getCulturalInsights.mutateAsync({
    location: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  });
  
  if (generatedCity) {
    setCities([generatedCity]);
    handleCitySelect(generatedCity);
    setError(`Successfully generated information for ${cityName}. This city has been added to our database.`);
  } else {
    setNewCityError(`Could not generate information for "${cityName}". Please try a different city name.`);
    const defaultCities = getCitiesByFilter({ limit: 8 });
    setCities(defaultCities);
  }
} catch (error) {
  console.error('Error fetching cultural insights:', error);
  setNewCityError(`Error generating data for "${cityName}". Please try a different city name.`);
  const defaultCities = getCitiesByFilter({ limit: 8 });
  setCities(defaultCities);
} finally {
  setIsLoading(false);
}
```

The file should now be properly formatted with all brackets closed and consistent whitespace. Let me know if you need any clarification on the fixes made.