'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, MapPin, Thermometer, Cloud, Sun, Moon } from 'lucide-react'
import { getGreeting, getLocalTime, getDynamicGradient } from '@/lib/dashboard'
import { getCurrentWeather, getWeatherEmoji } from '@/lib/weather'
import { WeatherData } from '@/types'

interface GreetingCardProps {
  userName: string
  userLocation?: string
}

/**
 * GreetingCard component
 * Modern greeting card with personalized greeting, local time, and weather information
 * Features dynamic gradient background that changes with time of day
 */
export default function GreetingCard({ userName, userLocation }: GreetingCardProps) {
  const [greeting, setGreeting] = useState<string>('')
  const [localTime, setLocalTime] = useState<string>('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradient, setGradient] = useState(getDynamicGradient())

  useEffect(() => {
    // Set initial greeting, time, and gradient immediately
    setGreeting(getGreeting(userName))
    setLocalTime(getLocalTime())
    setGradient(getDynamicGradient())
    setLoading(false) // Don't wait for weather to load

    // Update time and gradient every minute
    const timeInterval = setInterval(() => {
      setLocalTime(getLocalTime())
      setGradient(getDynamicGradient())
    }, 60000)

    // Fetch weather data in background (don't block rendering)
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
      }
    }

    fetchWeather()

    // Update greeting and gradient every hour
    const greetingInterval = setInterval(() => {
      setGreeting(getGreeting(userName))
      setGradient(getDynamicGradient())
    }, 3600000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(greetingInterval)
    }
  }, [userName, userLocation])

  if (loading) {
    return (
      <Card className="relative border border-border/80 shadow-sm overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
          <div className="mx-auto h-full w-full rounded-b-3xl bg-gradient-to-t from-primary/5 via-primary/2 to-transparent blur-3xl dark:from-primary/4 dark:via-primary/2" />
        </div>
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
    <Card className="relative border border-border/80 shadow-sm overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
        <div className="mx-auto h-full w-full rounded-b-3xl bg-gradient-to-t from-primary/5 via-primary/2 to-transparent blur-3xl dark:from-primary/4 dark:via-primary/2" />
      </div>
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
          <div className={`rounded-lg p-4 transition-all duration-300 bg-white/20 dark:bg-white/10 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
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
          <div className={`rounded-lg p-4 transition-all duration-300 bg-white/20 dark:bg-white/10 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
                {weather?.condition === 'Clear' ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Cloud className="h-5 w-5 text-primary" />
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
          <div className={`rounded-lg p-4 border border-border/50 hover:shadow-md transition-all duration-300 ${gradient.cardBg} ${gradient.darkCardBg} backdrop-blur-sm`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
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