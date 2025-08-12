import { WeatherData, GeolocationData } from '@/types'

/**
 * Weather service for fetching weather data
 * Uses OpenWeather API with geolocation and IP-based fallback
 */

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo-key'
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

/**
 * Get user's geolocation
 * @returns Promise<GeolocationData>
 */
export const getCurrentLocation = (): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  })
}

/**
 * Get location from IP address as fallback
 * @returns Promise<GeolocationData>
 */
export const getLocationFromIP = async (): Promise<GeolocationData> => {
  try {
    // Using ipapi.co for IP-based geolocation
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()

    if (data.error) {
      throw new Error('Failed to get location from IP')
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    }
  } catch (error) {
    // Fallback to a default location (San Francisco)
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: new Date(),
    }
  }
}

/**
 * Get weather data from OpenWeather API
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<WeatherData>
 */
export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      location: data.name,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
      lastUpdated: new Date(),
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // Return mock weather data for development or when API fails
    return {
      temperature: 72,
      condition: 'Clear',
      icon: '01d',
      location: 'Unknown Location',
      humidity: 65,
      windSpeed: 5,
      feelsLike: 74,
      lastUpdated: new Date(),
    }
  }
}

/**
 * Get weather data with automatic location detection
 * @returns Promise<WeatherData>
 */
export const getCurrentWeather = async (): Promise<WeatherData> => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    // Return mock weather data for development
    return {
      temperature: 72,
      condition: 'Clear',
      icon: '01d',
      location: 'San Francisco',
      humidity: 65,
      windSpeed: 5,
      feelsLike: 74,
      lastUpdated: new Date(),
    }
  }

  try {
    // Try to get user's geolocation first
    const location = await getCurrentLocation()
    return await getWeatherData(location.latitude, location.longitude)
  } catch (error) {
    console.warn('Geolocation failed, falling back to IP-based location:', error)
    
    try {
      // Fallback to IP-based location
      const location = await getLocationFromIP()
      return await getWeatherData(location.latitude, location.longitude)
    } catch (ipError) {
      console.error('IP-based location also failed:', ipError)
      
      // Final fallback to default location
      return await getWeatherData(37.7749, -122.4194)
    }
  }
}

/**
 * Get weather icon URL
 * @param iconCode - OpenWeather icon code
 * @returns string
 */
export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

/**
 * Get weather condition emoji
 * @param condition - Weather condition
 * @returns string
 */
export const getWeatherEmoji = (condition: string): string => {
  const emojiMap: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '🌫️',
    Haze: '🌫️',
    Dust: '🌫️',
    Fog: '🌫️',
    Sand: '🌫️',
    Ash: '🌫️',
    Squall: '💨',
    Tornado: '🌪️',
  }

  return emojiMap[condition] || '🌤️'
}

/**
 * Get skyline SVG based on location
 * @param location - City/location name
 * @returns string - SVG path data for the skyline
 */
export const getSkylineSVG = (location: string): string => {
  const locationLower = location.toLowerCase()
  
  // Major city skylines with their characteristic buildings
  const skylines: Record<string, string> = {
    'new york': 'M0,100 L20,80 L40,90 L60,70 L80,85 L100,60 L120,75 L140,65 L160,80 L180,70 L200,85 L220,75 L240,90 L260,80 L280,95 L300,70 L320,85 L340,75 L360,90 L380,80 L400,100 Z',
    'san francisco': 'M0,100 L30,85 L60,90 L90,75 L120,80 L150,70 L180,85 L210,75 L240,90 L270,80 L300,85 L330,75 L360,90 L390,80 L420,85 L450,75 L480,90 L510,80 L540,85 L570,75 L600,100 Z',
    'chicago': 'M0,100 L25,75 L50,85 L75,70 L100,80 L125,65 L150,85 L175,70 L200,80 L225,65 L250,85 L275,70 L300,80 L325,65 L350,85 L375,70 L400,80 L425,65 L450,85 L475,70 L500,100 Z',
    'los angeles': 'M0,100 L40,90 L80,85 L120,80 L160,75 L200,85 L240,80 L280,75 L320,80 L360,85 L400,80 L440,75 L480,80 L520,85 L560,80 L600,100 Z',
    'miami': 'M0,100 L50,85 L100,80 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
    'seattle': 'M0,100 L30,80 L60,85 L90,75 L120,80 L150,70 L180,85 L210,75 L240,80 L270,70 L300,85 L330,75 L360,80 L390,70 L420,85 L450,75 L480,80 L510,70 L540,85 L570,75 L600,100 Z',
    'boston': 'M0,100 L40,85 L80,80 L120,75 L160,80 L200,85 L240,80 L280,75 L320,80 L360,85 L400,80 L440,75 L480,80 L520,85 L560,80 L600,100 Z',
    'atlanta': 'M0,100 L50,80 L100,85 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
    'denver': 'M0,100 L60,85 L120,80 L180,75 L240,80 L300,85 L360,80 L420,75 L480,80 L540,85 L600,100 Z',
    'phoenix': 'M0,100 L75,85 L150,80 L225,75 L300,80 L375,85 L450,80 L525,75 L600,100 Z',
    'las vegas': 'M0,100 L100,85 L200,80 L300,75 L400,80 L500,85 L600,100 Z',
    'houston': 'M0,100 L50,80 L100,85 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
    'dallas': 'M0,100 L60,85 L120,80 L180,75 L240,80 L300,85 L360,80 L420,75 L480,80 L540,85 L600,100 Z',
    'philadelphia': 'M0,100 L40,85 L80,80 L120,75 L160,80 L200,85 L240,80 L280,75 L320,80 L360,85 L400,80 L440,75 L480,80 L520,85 L560,80 L600,100 Z',
    'washington': 'M0,100 L50,85 L100,80 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
    'austin': 'M0,100 L75,85 L150,80 L225,75 L300,80 L375,85 L450,80 L525,75 L600,100 Z',
    'nashville': 'M0,100 L100,85 L200,80 L300,75 L400,80 L500,85 L600,100 Z',
    'portland': 'M0,100 L50,85 L100,80 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
    'minneapolis': 'M0,100 L60,85 L120,80 L180,75 L240,80 L300,85 L360,80 L420,75 L480,80 L540,85 L600,100 Z',
    'detroit': 'M0,100 L50,80 L100,85 L150,75 L200,80 L250,85 L300,80 L350,75 L400,80 L450,85 L500,80 L550,75 L600,100 Z',
  }

  // Check for exact matches first
  for (const [city, skyline] of Object.entries(skylines)) {
    if (locationLower.includes(city)) {
      return skyline
    }
  }

  // Check for partial matches
  for (const [city, skyline] of Object.entries(skylines)) {
    if (city.includes(locationLower) || locationLower.includes(city)) {
      return skyline
    }
  }

  // Default generic skyline for unknown locations
  return 'M0,100 L30,85 L60,80 L90,75 L120,80 L150,85 L180,80 L210,75 L240,80 L270,85 L300,80 L330,75 L360,80 L390,85 L420,80 L450,75 L480,80 L510,85 L540,80 L570,75 L600,100 Z'
} 