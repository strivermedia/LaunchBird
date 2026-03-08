'use client'

import React, { useState } from 'react'
import { Send, MessageSquare, Star, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitClientFeedback } from '@/lib/client-portal'

interface FeedbackFormProps {
  projectId: string
}

/**
 * Feedback Form Component
 * Allows clients to submit feedback and ratings
 */
export default function FeedbackForm({ projectId }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '',
    category: '',
    comment: '',
  })

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.rating || !formData.comment.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await submitClientFeedback({
        projectId,
        clientName: formData.name,
        clientEmail: formData.email,
        rating: parseInt(formData.rating),
        category: formData.category as any,
        comment: formData.comment,
      })

      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        rating: '',
        category: '',
        comment: '',
      })
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Render star rating
   */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-500 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  if (isSubmitted) {
    return (
      <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white">
                Thank You!
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                Your feedback has been submitted successfully.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
      <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Send Feedback</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-muted-foreground">
          Share your thoughts and help us improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground dark:text-white">
              Your Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-background border-border focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground dark:text-white">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-background border-border focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground dark:text-white">
              Overall Rating *
            </Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleInputChange('rating', rating.toString())}
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`h-6 w-6 ${
                      parseInt(formData.rating) >= rating 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                {formData.rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground dark:text-white">
              Feedback Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="design">Design & UI/UX</SelectItem>
                <SelectItem value="functionality">Functionality</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="timeline">Timeline & Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-foreground dark:text-white">
              Your Feedback *
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className="bg-background border-border focus:border-primary focus:ring-primary resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-muted/50 dark:bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            Your feedback helps us improve our services. We respect your privacy and will only use this information to enhance your project experience.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

