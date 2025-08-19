/**
 * ProjectWizard Component
 * Multi-step wizard for creating new projects with template selection
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Globe, 
  Target, 
  Users, 
  Calendar,
  DollarSign,
  FileText,
  Code
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { Project, ProjectType, ProjectStatus } from '@/types'

// Form validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  type: z.enum(['one-time', 'ongoing']),
  template: z.enum(['web-development', 'ppc-management', 'none']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.number().min(0).optional(),
  clientId: z.string().optional(),
  assignedTo: z.array(z.string()).min(1, 'At least one team member must be assigned'),
  tags: z.array(z.string()).optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: (project: Project) => void
}

// Project templates
const projectTemplates = [
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Complete website development with modern design and functionality',
    icon: Globe,
    features: ['Responsive Design', 'SEO Optimization', 'Content Management', 'Analytics Integration'],
    estimatedDuration: '4-8 weeks',
    estimatedBudget: '$5,000 - $15,000'
  },
  {
    id: 'ppc-management',
    name: 'PPC Management',
    description: 'Ongoing PPC campaign management and optimization',
    icon: Target,
    features: ['Campaign Setup', 'Keyword Research', 'Performance Monitoring', 'Monthly Reports'],
    estimatedDuration: 'Ongoing',
    estimatedBudget: '$1,000 - $5,000/month'
  },
  {
    id: 'none',
    name: 'Custom Project',
    description: 'Create a project from scratch with custom requirements',
    icon: FileText,
    features: ['Custom Requirements', 'Flexible Timeline', 'Custom Budget'],
    estimatedDuration: 'Variable',
    estimatedBudget: 'Custom'
  }
]

// Mock team members
const mockTeamMembers = [
  { id: 'user-1', name: 'John Doe', title: 'Senior Developer', email: 'john@launchbird.com' },
  { id: 'user-2', name: 'Jane Smith', title: 'UI/UX Designer', email: 'jane@launchbird.com' },
  { id: 'user-3', name: 'Mike Johnson', title: 'Marketing Specialist', email: 'mike@launchbird.com' },
  { id: 'user-4', name: 'Sarah Wilson', title: 'Project Manager', email: 'sarah@launchbird.com' }
]

/**
 * Generate a random 4-character client code
 */
const generateClientCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * ProjectWizard component
 * Multi-step wizard for creating new projects
 */
export default function ProjectWizard({ open, onOpenChange, onProjectCreated }: ProjectWizardProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none')
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: 'one-time',
      template: 'none',
      assignedTo: []
    }
  })

  const watchedType = watch('type')
  const watchedTemplate = watch('template')

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setValue('template', templateId as any)
    
    // Auto-fill based on template
    if (templateId === 'web-development') {
      setValue('type', 'one-time')
      setValue('tags', ['web-development', 'design', 'development'])
    } else if (templateId === 'ppc-management') {
      setValue('type', 'ongoing')
      setValue('tags', ['ppc', 'marketing', 'advertising'])
    }
  }

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
    setValue('assignedTo', selectedTeamMembers)
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Create new project
      const newProject: Project = {
        id: `project-${Date.now()}`,
        organizationId: user?.organizationId || 'org-1',
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'planning',
        progress: 0,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        assignedTo: selectedTeamMembers,
        createdBy: user?.uid || 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: data.clientId,
        budget: data.budget,
        tags: data.tags,
        clientCode: generateClientCode(),
        assignedManagerId: user?.uid || 'user-1',
        assignedManagerName: user?.title || 'Project Manager',
        assignedManagerTitle: user?.title || 'Manager',
        assignedManagerEmail: user?.email || 'manager@launchbird.com',
        assignedManagerPhone: '+1-555-0000'
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onProjectCreated(newProject)
      onOpenChange(false)
      
      // Reset form
      setStep(1)
      setSelectedTemplate('none')
      setSelectedTeamMembers([])
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const getStepProgress = () => (step / 4) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Project
          </DialogTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Choose a Project Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a template to get started quickly, or create a custom project
                </p>
              </div>

              <div className="grid gap-4">
                {projectTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <Card 
                      key={template.id}
                                             className={`cursor-pointer transition-all hover:shadow-md ${
                         selectedTemplate === template.id 
                           ? 'ring-2 ring-primary bg-primary/5' 
                           : ''
                       }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                                                         <div className="p-2 bg-primary/10 rounded-lg">
                               <Icon className="h-6 w-6 text-primary" />
                             </div>
                            <div>
                              <CardTitle className="text-lg text-gray-900 dark:text-white">
                                {template.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                                                     {selectedTemplate === template.id && (
                             <Check className="h-5 w-5 text-primary" />
                           )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features:</h4>
                            <div className="flex flex-wrap gap-2">
                              {template.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{template.estimatedDuration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{template.estimatedBudget}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Project Details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Provide basic information about your project
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter project title"
                    className="mt-1"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe your project"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Project Type *</Label>
                    <Select 
                      value={watchedType} 
                      onValueChange={(value) => setValue('type', value as ProjectType)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time Project</SelectItem>
                        <SelectItem value="ongoing">Ongoing Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      {...register('budget', { valueAsNumber: true })}
                      placeholder="Enter budget amount"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className="mt-1"
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                    )}
                  </div>

                  {watchedType === 'one-time' && (
                    <>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...register('endDate')}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          {...register('deadline')}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Assign Team Members
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select team members to work on this project
                </p>
              </div>

              <div className="space-y-3">
                {mockTeamMembers.map((member) => (
                  <Card 
                    key={member.id}
                                         className={`cursor-pointer transition-all hover:shadow-md ${
                       selectedTeamMembers.includes(member.id) 
                         ? 'ring-2 ring-primary bg-primary/5' 
                         : ''
                     }`}
                    onClick={() => handleTeamMemberToggle(member.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedTeamMembers.includes(member.id)}
                            onCheckedChange={() => handleTeamMemberToggle(member.id)}
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {member.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                                                 {selectedTeamMembers.includes(member.id) && (
                           <Check className="h-5 w-5 text-primary" />
                         )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedTeamMembers.length === 0 && (
                <p className="text-red-500 text-sm">
                  Please select at least one team member
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review & Create */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Review Project Details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review your project details before creating
                </p>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Project Title
                        </Label>
                        <p className="text-gray-900 dark:text-white">{watch('title')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Project Type
                        </Label>
                        <Badge variant="outline">{watchedType.replace('-', ' ')}</Badge>
                      </div>
                    </div>

                    {watch('description') && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Description
                        </Label>
                        <p className="text-gray-900 dark:text-white">{watch('description')}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Start Date
                        </Label>
                        <p className="text-gray-900 dark:text-white">{watch('startDate')}</p>
                      </div>
                      {watch('endDate') && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            End Date
                          </Label>
                          <p className="text-gray-900 dark:text-white">{watch('endDate')}</p>
                        </div>
                      )}
                      {watch('budget') && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Budget
                          </Label>
                          <p className="text-gray-900 dark:text-white">
                            ${watch('budget')?.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Team Members ({selectedTeamMembers.length})
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTeamMembers.map((memberId) => {
                          const member = mockTeamMembers.find(m => m.id === memberId)
                          return (
                            <Badge key={memberId} variant="secondary">
                              {member?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && !selectedTemplate) ||
                    (step === 2 && !watch('title')) ||
                    (step === 3 && selectedTeamMembers.length === 0)
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
