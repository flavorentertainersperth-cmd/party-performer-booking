'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, DollarSign, Heart, Share } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Performer {
  id: string
  stage_name: string
  bio: string
  performance_types: string[]
  service_areas: string[]
  base_rate: number
  hourly_rate: number
  rating: number
  total_reviews: number
  featured: boolean
  verified: boolean
  user: {
    profile_picture_url: string
    first_name: string
    last_name: string
  }
}

interface PerformerGridProps {
  searchQuery?: string
  performanceType?: string
  location?: string
  priceRange?: [number, number]
}

export function PerformerGrid({
  searchQuery,
  performanceType,
  location,
  priceRange
}: PerformerGridProps = {}) {
  const [performers, setPerformers] = useState<Performer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPerformers()
  }, [searchParams])

  const fetchPerformers = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('performers')
        .select(`
          *,
          user:users!inner(
            profile_picture_url,
            first_name,
            last_name
          )
        `)
        .order('featured', { ascending: false })
        .order('rating', { ascending: false })

      // Apply filters based on URL params
      const search = searchParams.get('search')
      const type = searchParams.get('type')
      const loc = searchParams.get('location')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')

      if (search) {
        query = query.or(`stage_name.ilike.%${search}%,bio.ilike.%${search}%`)
      }

      if (type) {
        query = query.contains('performance_types', [type])
      }

      if (loc) {
        query = query.contains('service_areas', [loc])
      }

      if (minPrice) {
        query = query.gte('hourly_rate', parseInt(minPrice))
      }

      if (maxPrice) {
        query = query.lte('hourly_rate', parseInt(maxPrice))
      }

      const { data, error } = await query

      if (error) throw error

      setPerformers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (performerId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(performerId)) {
        newFavorites.delete(performerId)
      } else {
        newFavorites.add(performerId)
      }
      return newFavorites
    })
  }

  const sharePerformer = async (performer: Performer) => {
    if (navigator.share) {
      await navigator.share({
        title: performer.stage_name,
        text: performer.bio,
        url: `${window.location.origin}/performers/${performer.id}`
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/performers/${performer.id}`)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading performers: {error}</p>
        <Button onClick={() => fetchPerformers()}>Try Again</Button>
      </div>
    )
  }

  if (performers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No performers found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search criteria.
        </p>
        <Button onClick={() => router.push('/performers')}>
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {performers.length} performer{performers.length !== 1 ? 's' : ''} found
        </p>
        <select className="border rounded-md px-3 py-2 bg-white">
          <option value="featured">Featured First</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {performers.map((performer) => (
          <Card key={performer.id} className="card-hover group">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg overflow-hidden">
                {performer.user.profile_picture_url ? (
                  <Image
                    src={performer.user.profile_picture_url}
                    alt={performer.stage_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">
                      {performer.stage_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {performer.featured && (
                  <Badge className="bg-yellow-500 text-yellow-50">Featured</Badge>
                )}
                {performer.verified && (
                  <Badge className="bg-blue-500 text-blue-50">Verified</Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="p-2"
                  onClick={() => toggleFavorite(performer.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(performer.id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="p-2"
                  onClick={() => sharePerformer(performer)}
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{performer.stage_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{performer.rating?.toFixed(1) || 'New'}</span>
                      {performer.total_reviews > 0 && (
                        <span>({performer.total_reviews} reviews)</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {performer.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {performer.performance_types.slice(0, 3).map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                  {performer.performance_types.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{performer.performance_types.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{performer.service_areas[0] || 'Multiple areas'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(performer.hourly_rate)}/hr</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex gap-2">
                    <Link href={`/performers/${performer.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/book/${performer.id}`} className="flex-1">
                      <Button className="w-full">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {performers.length >= 12 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Performers
          </Button>
        </div>
      )}
    </div>
  )
}