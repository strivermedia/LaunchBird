'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { TeamMemberWorkload } from '@/types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface TeamWorkloadProps {
  teamWorkload: TeamMemberWorkload[]
  loading?: boolean
}

/**
 * TeamWorkload component
 * Modern team workload visualization with clean chart design
 */
export default function TeamWorkload({ teamWorkload, loading = false }: TeamWorkloadProps) {
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#9844fc',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0].label
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
    },
  }

  const chartData = {
    labels: teamWorkload.map(member => member.userName),
    datasets: [
      {
        label: 'Completed Tasks',
        data: teamWorkload.map(member => member.completedTasks),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'In Progress Tasks',
        data: teamWorkload.map(member => member.inProgressTasks),
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Overdue Tasks',
        data: teamWorkload.map(member => member.overdueTasks),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const getMemberEfficiency = (member: TeamMemberWorkload) => {
    const totalTasks = member.totalTasks
    if (totalTasks === 0) return 0
    return Math.round((member.completedTasks / totalTasks) * 100)
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Workload
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Task distribution and performance
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-[#9844fc] text-[#9844fc] hover:bg-[#9844fc] hover:text-white">
            View Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {teamWorkload.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#9844fc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-[#9844fc]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No team data
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Team workload will appear here
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="mb-6">
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">Overdue</span>
              </div>
            </div>

            {/* Team Member Details */}
            <div className="space-y-3">
              {teamWorkload.map((member) => {
                const efficiency = getMemberEfficiency(member)
                const isEfficient = efficiency >= 80
                const isStruggling = efficiency <= 50

                return (
                  <div
                    key={member.userId}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#9844fc]/10 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <Image 
                              src={member.avatar} 
                              alt={member.userName}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-[#9844fc] font-medium text-sm">
                              {member.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {member.userName}
                          </h4>
                          {member.userTitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.userTitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isEfficient ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : isStruggling ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          isEfficient ? 'text-green-600 dark:text-green-400' :
                          isStruggling ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-300'
                        }`}>
                          {efficiency}% efficiency
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {member.completedTasks}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Completed</span>
                      </div>
                      
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                            {member.inProgressTasks}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">In Progress</span>
                      </div>
                      
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">
                            {member.overdueTasks}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300">Overdue</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total Hours</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {member.totalHours}h
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 