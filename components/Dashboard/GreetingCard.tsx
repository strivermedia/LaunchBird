'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Thermometer, Cloud, Sun, Moon, Calendar } from 'lucide-react'
import { getGreeting, getLocalTime, getCurrentDate, getDynamicGradient } from '@/lib/dashboard'
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
  const [currentDate, setCurrentDate] = useState<string>('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradient, setGradient] = useState(getDynamicGradient())

  useEffect(() => {
    // Set initial greeting, time, date, and gradient immediately
    setGreeting(getGreeting(userName))
    setLocalTime(getLocalTime())
    setCurrentDate(getCurrentDate())
    setGradient(getDynamicGradient())
    setLoading(false) // Don't wait for weather to load

    // Update time, date, and gradient every minute
    const timeInterval = setInterval(() => {
      setLocalTime(getLocalTime())
      setCurrentDate(getCurrentDate())
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
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div 
          className="mx-auto h-full w-full"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, oklch(0.5106 0.2301 276.9656 / 0.05) 30%, oklch(0.5106 0.2301 276.9656 / 0.15) 60%, oklch(0.5106 0.2301 276.9656 / 0.25) 80%, oklch(0.5106 0.2301 276.9656 / 0.35) 100%)'
          }}
        />
      </div>
      <div className="relative z-10">
        <CardHeader className="pb-6">
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Local Time */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
              <Clock className="h-6 w-6 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Local Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {localTime}
              </p>
            </div>
          </div>

          {/* Current Date */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
              <Calendar className="h-6 w-6 text-black dark:text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentDate}
              </p>
            </div>
          </div>

          {/* Weather Information */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-md flex items-center justify-center">
              {weather?.condition === 'Clear' ? (
                <Sun className="h-6 w-6 text-black dark:text-white" />
              ) : (
                <Cloud className="h-6 w-6 text-black dark:text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {weather?.location || userLocation || 'Location'}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather?.temperature}°
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {getWeatherEmoji(weather?.condition || 'Clear')} {weather?.condition}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      </div>
    </Card>
  )
} 