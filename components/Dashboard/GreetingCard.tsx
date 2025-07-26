'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, MapPin, Thermometer, Cloud, Sun, Moon } from 'lucide-react'
import { getGreeting, getLocalTime } from '@/lib/dashboard'
import { getCurrentWeather, getWeatherEmoji } from '@/lib/weather'
import { WeatherData } from '@/types'

interface GreetingCardProps {
  userName: string
  userLocation?: string
}

/**
 * GreetingCard component
 * Modern greeting card with personalized greeting, local time, and weather information
 */
export default function GreetingCard({ userName, userLocation }: GreetingCardProps) {
  const [greeting, setGreeting] = useState<string>('')
  const [localTime, setLocalTime] = useState<string>('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set initial greeting and time
    setGreeting(getGreeting(userName))
    setLocalTime(getLocalTime())

    // Update time every minute
    const timeInterval = setInterval(() => {
      setLocalTime(getLocalTime())
    }, 60000)

    // Fetch weather data
    const fetchWeather = async () => {
      try {
        const weatherData = await getCurrentWeather()
        setWeather(weatherData)
      } catch (error) {
        console.error('Error fetching weather:', error)
        // Set fallback weather data
        setWeather({
          temperature: 72,
          condition: 'Clear',
          icon: '01d',
          location: userLocation || 'Unknown Location',
          humidity: 65,
          windSpeed: 5,
          feelsLike: 74,
          lastUpdated: new Date(),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Update greeting every hour
    const greetingInterval = setInterval(() => {
      setGreeting(getGreeting(userName))
    }, 3600000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(greetingInterval)
    }
  }, [userName, userLocation])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}
        </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
            Here&apos;s what&apos;s happening today
          </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Local Time */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-[#9844fc]/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#9844fc]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Local Time</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current time</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {localTime}
            </p>
          </div>

          {/* Weather Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-[#9844fc]/10 rounded-lg flex items-center justify-center">
                {weather?.condition === 'Clear' ? (
                  <Sun className="h-5 w-5 text-[#9844fc]" />
                ) : (
                  <Cloud className="h-5 w-5 text-[#9844fc]" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Weather</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {weather?.location || userLocation || 'Location'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {weather?.temperature}°
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                {getWeatherEmoji(weather?.condition || 'Clear')} {weather?.condition}
              </span>
            </div>
            {weather?.feelsLike && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Feels like {weather.feelsLike}°
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-[#9844fc]/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-[#9844fc]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your area</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {weather?.location || userLocation || 'Unknown Location'}
            </p>
            {weather?.humidity && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Humidity: {weather.humidity}%
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 