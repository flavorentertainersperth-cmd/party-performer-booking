'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/ui/file-upload'
import { Loader2, Upload, User, MapPin, Briefcase, Star } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const applicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  location: z.string().min(2, 'Location is required'),
  performanceType: z.string().min(1, 'Performance type is required'),
  experienceYears: z.number().min(0, 'Experience years is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  stageName: z.string().min(2, 'Stage name is required'),
  socialMediaLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    website: z.string().optional(),
  }),
  references: z.array(z.object({
    name: z.string().min(2, 'Reference name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().min(10, 'Reference phone is required'),
    email: z.string().email('Valid reference email is required'),
  })).min(2, 'At least 2 references are required'),
  equipment: z.string().min(20, 'Equipment details are required'),
  insurance: z.boolean(),
  workingWithChildren: z.boolean(),
  criminalHistory: z.boolean(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

const performanceTypes = [
  'Musician - Solo',
  'Musician - Band',
  'Singer',
  'DJ',
  'Dancer',
  'Comedian',
  'Magician',
  'MC/Host',
  'Actor',
  'Circus Performer',
  'Other',
]

export function VettingApplicationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      references: [
        { name: '', relationship: '', phone: '', email: '' },
        { name: '', relationship: '', phone: '', email: '' },
      ],
      socialMediaLinks: {},
      insurance: false,
      workingWithChildren: false,
      criminalHistory: false,
      terms: false,
    },
  })

  const references = watch('references')

  const addReference = () => {
    setValue('references', [
      ...references,
      { name: '', relationship: '', phone: '', email: '' },
    ])
  }

  const removeReference = (index: number) => {
    if (references.length > 2) {
      setValue('references', references.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to submit an application')
        return
      }

      // Upload files to storage
      const portfolioUrls: string[] = []
      const documentUrls: Record<string, string> = {}

      // Upload portfolio files
      if (uploadedFiles.portfolio) {
        for (const file of uploadedFiles.portfolio) {
          const fileName = `${user.id}/portfolio/${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('performer-files')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('performer-files')
            .getPublicUrl(fileName)

          portfolioUrls.push(publicUrl)
        }
      }

      // Upload document files
      for (const [docType, files] of Object.entries(uploadedFiles)) {
        if (docType !== 'portfolio' && files.length > 0) {
          const fileName = `${user.id}/documents/${docType}-${files[0].name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('performer-files')
            .upload(fileName, files[0])

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('performer-files')
            .getPublicUrl(fileName)

          documentUrls[docType] = publicUrl
        }
      }

      // Create application record
      const applicationData = {
        user_id: user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        location: data.location,
        performance_type: data.performanceType,
        experience_years: data.experienceYears,
        portfolio_urls: portfolioUrls,
        documents: {
          ...documentUrls,
          references: data.references,
          equipment: data.equipment,
          social_media: data.socialMediaLinks,
          insurance: data.insurance,
          working_with_children: data.workingWithChildren,
          criminal_history: data.criminalHistory,
        },
        status: 'pending' as const,
      }

      const { error: applicationError } = await supabase
        .from('vetting_applications')
        .insert(applicationData)

      if (applicationError) throw applicationError

      // Update user profile with stage name and bio
      await supabase
        .from('users')
        .update({
          metadata: {
            stage_name: data.stageName,
            bio: data.bio,
          },
        })
        .eq('id', user.id)

      router.push('/vetting/submitted')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (field: string, files: File[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: files,
    }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Legal Name *</Label>
              <Input
                {...register('fullName')}
                id="fullName"
                placeholder="John Smith"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageName">Stage/Performance Name *</Label>
              <Input
                {...register('stageName')}
                id="stageName"
                placeholder="Johnny the Entertainer"
                disabled={isLoading}
              />
              {errors.stageName && (
                <p className="text-sm text-red-600">{errors.stageName.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                {...register('phone')}
                id="phone"
                type="tel"
                placeholder="+61 4XX XXX XXX"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                {...register('dateOfBirth')}
                id="dateOfBirth"
                type="date"
                disabled={isLoading}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City, State) *</Label>
              <Input
                {...register('location')}
                id="location"
                placeholder="Sydney, NSW"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Performance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="performanceType">Performance Type *</Label>
              <Controller
                name="performanceType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.performanceType && (
                <p className="text-sm text-red-600">{errors.performanceType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience *</Label>
              <Input
                {...register('experienceYears', { valueAsNumber: true })}
                id="experienceYears"
                type="number"
                min="0"
                placeholder="5"
                disabled={isLoading}
              />
              {errors.experienceYears && (
                <p className="text-sm text-red-600">{errors.experienceYears.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography/Description *</Label>
            <Textarea
              {...register('bio')}
              id="bio"
              placeholder="Tell us about your performance style, experience, and what makes you unique..."
              rows={4}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment & Technical Requirements *</Label>
            <Textarea
              {...register('equipment')}
              id="equipment"
              placeholder="List your equipment, technical requirements, setup needs, etc."
              rows={3}
              disabled={isLoading}
            />
            {errors.equipment && (
              <p className="text-sm text-red-600">{errors.equipment.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media & Portfolio Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                {...register('socialMediaLinks.instagram')}
                id="instagram"
                placeholder="@yourusername"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                {...register('socialMediaLinks.facebook')}
                id="facebook"
                placeholder="facebook.com/yourpage"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                {...register('socialMediaLinks.youtube')}
                id="youtube"
                placeholder="youtube.com/channel/..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                {...register('socialMediaLinks.website')}
                id="website"
                placeholder="www.yourwebsite.com"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Documents & Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Portfolio (Photos/Videos) *</Label>
            <FileUpload
              onFilesSelected={(files) => handleFileUpload('portfolio', files)}
              accept="image/*,video/*"
              multiple
              maxFiles={10}
            />
            <p className="text-sm text-muted-foreground">
              Upload your best performance photos and videos (max 10 files)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Government ID *</Label>
            <FileUpload
              onFilesSelected={(files) => handleFileUpload('id', files)}
              accept="image/*,.pdf"
              maxFiles={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Insurance Certificate</Label>
            <FileUpload
              onFilesSelected={(files) => handleFileUpload('insurance', files)}
              accept="image/*,.pdf"
              maxFiles={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Working with Children Check</Label>
            <FileUpload
              onFilesSelected={(files) => handleFileUpload('wwcc', files)}
              accept="image/*,.pdf"
              maxFiles={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle>Professional References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {references.map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Reference {index + 1}</h4>
                {references.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeReference(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    {...register(`references.${index}.name`)}
                    placeholder="Reference name"
                    disabled={isLoading}
                  />
                  {errors.references?.[index]?.name && (
                    <p className="text-sm text-red-600">{errors.references[index]?.name?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Relationship *</Label>
                  <Input
                    {...register(`references.${index}.relationship`)}
                    placeholder="Former client, venue manager, etc."
                    disabled={isLoading}
                  />
                  {errors.references?.[index]?.relationship && (
                    <p className="text-sm text-red-600">{errors.references[index]?.relationship?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    {...register(`references.${index}.phone`)}
                    placeholder="+61 4XX XXX XXX"
                    disabled={isLoading}
                  />
                  {errors.references?.[index]?.phone && (
                    <p className="text-sm text-red-600">{errors.references[index]?.phone?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    {...register(`references.${index}.email`)}
                    type="email"
                    placeholder="reference@example.com"
                    disabled={isLoading}
                  />
                  {errors.references?.[index]?.email && (
                    <p className="text-sm text-red-600">{errors.references[index]?.email?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addReference}>
            Add Another Reference
          </Button>
        </CardContent>
      </Card>

      {/* Declarations */}
      <Card>
        <CardHeader>
          <CardTitle>Declarations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="insurance"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="insurance"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="insurance">
              I have public liability insurance coverage
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="workingWithChildren"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="workingWithChildren"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="workingWithChildren">
              I have a valid Working with Children Check (if applicable)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="criminalHistory"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="criminalHistory"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="criminalHistory">
              I declare that I have no criminal history that would affect my ability to perform at events
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="terms">
              I agree to the Terms of Service and Privacy Policy *
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms.message}</p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Application...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </form>
  )
}