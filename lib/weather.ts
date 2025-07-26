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