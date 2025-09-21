'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Search, MapPin, DollarSign, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

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
  'Circus Performer'
]

const australianCities = [
  'Sydney, NSW',
  'Melbourne, VIC',
  'Brisbane, QLD',
  'Perth, WA',
  'Adelaide, SA',
  'Canberra, ACT',
  'Gold Coast, QLD',
  'Newcastle, NSW',
  'Wollongong, NSW',
  'Sunshine Coast, QLD'
]

export function PerformerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('type')?.split(',') || []
  )
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    searchParams.get('location')?.split(',') || []
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || '50'),
    parseInt(searchParams.get('maxPrice') || '500')
  ])
  const [availableOnly, setAvailableOnly] = useState(
    searchParams.get('available') === 'true'
  )
  const [featuredOnly, setFeaturedOnly] = useState(
    searchParams.get('featured') === 'true'
  )
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get('verified') === 'true'
  )

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','))
    if (selectedLocations.length > 0) params.set('location', selectedLocations.join(','))
    if (priceRange[0] > 50) params.set('minPrice', priceRange[0].toString())
    if (priceRange[1] < 500) params.set('maxPrice', priceRange[1].toString())
    if (availableOnly) params.set('available', 'true')
    if (featuredOnly) params.set('featured', 'true')
    if (verifiedOnly) params.set('verified', 'true')

    router.push(`/performers?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTypes([])
    setSelectedLocations([])
    setPriceRange([50, 500])
    setAvailableOnly(false)
    setFeaturedOnly(false)
    setVerifiedOnly(false)
    router.push('/performers')
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const hasActiveFilters = () => {
    return searchQuery !== '' ||
           selectedTypes.length > 0 ||
           selectedLocations.length > 0 ||
           priceRange[0] > 50 ||
           priceRange[1] < 500 ||
           availableOnly ||
           featuredOnly ||
           verifiedOnly
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search performers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Types */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <Label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {australianCities.map((city) => (
              <div key={city} className="flex items-center space-x-2">
                <Checkbox
                  id={city}
                  checked={selectedLocations.includes(city)}
                  onCheckedChange={() => toggleLocation(city)}
                />
                <Label htmlFor={city} className="text-sm cursor-pointer">
                  {city}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Hourly Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              min={50}
              max={500}
              step={25}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability & Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={availableOnly}
                onCheckedChange={setAvailableOnly}
              />
              <Label htmlFor="available" className="text-sm cursor-pointer">
                Available this week
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featuredOnly}
                onCheckedChange={setFeaturedOnly}
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                Featured performers only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">
                Verified performers only
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedTypes.map(type => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleType(type)} />
                </Badge>
              ))}
              {selectedLocations.map(location => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleLocation(location)} />
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Apply Filters Button */}
      <div className="sticky bottom-4">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}