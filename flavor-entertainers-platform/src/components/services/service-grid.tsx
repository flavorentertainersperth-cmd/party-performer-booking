'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Shield, AlertTriangle } from 'lucide-react';
import {
  SERVICE_CATEGORY_NAMES,
  formatRate,
  formatDuration,
  type ServiceCategory,
  type Service
} from '@/lib/types/services';

// Mock data - this would come from Supabase in a real implementation
const mockServices: Service[] = [
  // Waitressing Services
  {
    id: '1',
    category: 'waitressing',
    name: 'Clothed (Public Bar)',
    description: 'Fully clothed. Suitable for licensed venues.',
    base_rate: 35.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Public bar service',
    is_private_only: false,
    age_restricted: false,
    requires_special_license: false,
    is_active: true,
    display_order: 1,
    created_at: '',
    updated_at: ''
  },
  {
    id: '2',
    category: 'waitressing',
    name: 'Skimpy (Public Bar)',
    description: 'Bikini or skimpy outfit service in public venues.',
    base_rate: 50.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Public bar service',
    is_private_only: false,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 2,
    created_at: '',
    updated_at: ''
  },
  {
    id: '3',
    category: 'waitressing',
    name: 'Clothed (Private)',
    description: 'Fully clothed service for private events.',
    base_rate: 90.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Private events only',
    is_private_only: true,
    age_restricted: false,
    requires_special_license: false,
    is_active: true,
    display_order: 3,
    created_at: '',
    updated_at: ''
  },
  {
    id: '4',
    category: 'waitressing',
    name: 'Skimpy / Lingerie (Private)',
    description: 'Sexy skimpy or lingerie outfit, engaging service.',
    base_rate: 110.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Private events only',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 4,
    created_at: '',
    updated_at: ''
  },
  {
    id: '5',
    category: 'waitressing',
    name: 'Topless (Private)',
    description: 'Topless waitress for cheeky and bold events.',
    base_rate: 160.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Private events only',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 5,
    created_at: '',
    updated_at: ''
  },
  {
    id: '6',
    category: 'waitressing',
    name: 'Nude (Private)',
    description: 'Fully nude waitress, boldest adult entertainment.',
    base_rate: 260.00,
    rate_type: 'per_hour',
    min_duration_minutes: 60,
    booking_notes: 'Private events only',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 6,
    created_at: '',
    updated_at: ''
  },
  // Lap Dance Services
  {
    id: '7',
    category: 'lap_dance',
    name: 'Private Lap Dance',
    description: '1 song, 1-on-1 dance in private space.',
    base_rate: 100.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 3,
    booking_notes: 'Minimum rate',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 11,
    created_at: '',
    updated_at: ''
  },
  {
    id: '8',
    category: 'lap_dance',
    name: 'Public Lap Dance',
    description: 'Lap dance in front of others, charged per person.',
    base_rate: 100.00,
    rate_type: 'per_person',
    min_duration_minutes: 3,
    booking_notes: 'Becomes strip show; e.g., 3 viewers = $300',
    is_private_only: false,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 12,
    created_at: '',
    updated_at: ''
  },
  // Strip Show Services
  {
    id: '9',
    category: 'strip_show',
    name: 'Hot Classic Strip (HCS)',
    description: 'Classic strip show, full of tease and heat.',
    base_rate: 400.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 15,
    booking_notes: 'Minimum charge',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 21,
    created_at: '',
    updated_at: ''
  },
  {
    id: '10',
    category: 'strip_show',
    name: 'Deluxe Hot Classic Strip (DHCS)',
    description: 'Enhanced classic strip with deluxe elements.',
    base_rate: 450.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 20,
    booking_notes: 'Minimum charge',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 22,
    created_at: '',
    updated_at: ''
  },
  {
    id: '11',
    category: 'strip_show',
    name: 'Toy Show (TOY)',
    description: 'Nude strip show including toy play.',
    base_rate: 500.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 20,
    booking_notes: 'Explicit content',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 23,
    created_at: '',
    updated_at: ''
  },
  {
    id: '12',
    category: 'strip_show',
    name: 'PVC Show (PVC)',
    description: 'Pearls Vibrator and cream show',
    base_rate: 550.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 30,
    booking_notes: 'Optional themed outfits',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 24,
    created_at: '',
    updated_at: ''
  },
  {
    id: '13',
    category: 'strip_show',
    name: 'XXX Show',
    description: 'This wild show includes explicit toy play, seductive body interaction, and a full fantasy experience designed to leave your audience breathless.',
    base_rate: 850.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 40,
    booking_notes: 'Premium adult entertainment',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 25,
    created_at: '',
    updated_at: ''
  },
  {
    id: '14',
    category: 'strip_show',
    name: 'Greek Show',
    description: 'Our most exclusive and provocative act — a deluxe full nude strip that includes "Greek" anal toy play. This show delivers intense, adult-only fantasy fulfillment with high-impact visuals and unforgettable performance energy.',
    base_rate: 900.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 40,
    booking_notes: 'Optional themed outfits',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 26,
    created_at: '',
    updated_at: ''
  },
  {
    id: '15',
    category: 'strip_show',
    name: 'Duo Show (DUO)',
    description: 'Two entertainers in explicit fantasy performance.',
    base_rate: 0.00,
    rate_type: 'flat_rate',
    min_duration_minutes: 40,
    booking_notes: 'Enquire for pricing - Premium duo act',
    is_private_only: true,
    age_restricted: true,
    requires_special_license: false,
    is_active: true,
    display_order: 27,
    created_at: '',
    updated_at: ''
  }
];

function ServiceCard({ service }: { service: Service }) {
  const getCategoryColor = (category: ServiceCategory) => {
    switch (category) {
      case 'waitressing':
        return 'bg-blue-500';
      case 'lap_dance':
        return 'bg-purple-500';
      case 'strip_show':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
            {service.name}
          </CardTitle>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="secondary" className={`text-white ${getCategoryColor(service.category)}`}>
              {SERVICE_CATEGORY_NAMES[service.category]}
            </Badge>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatRate(service.base_rate, service.rate_type)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {service.description}
        </p>

        <div className="space-y-3">
          {/* Duration */}
          {service.min_duration_minutes && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Min duration: {formatDuration(service.min_duration_minutes)}</span>
            </div>
          )}

          {/* Restrictions */}
          <div className="flex flex-wrap gap-2">
            {service.is_private_only && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Private Only
              </Badge>
            )}
            {service.age_restricted && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                18+ Only
              </Badge>
            )}
            {!service.is_private_only && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                <Users className="h-3 w-3 mr-1" />
                Public Venue
              </Badge>
            )}
          </div>

          {/* Booking Notes */}
          {service.booking_notes && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
              <strong>Note:</strong> {service.booking_notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceGrid() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    setServices(mockServices);
  }, []);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  const categories: Array<{ value: ServiceCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Services' },
    { value: 'waitressing', label: 'Waitressing' },
    { value: 'lap_dance', label: 'Lap Dance' },
    { value: 'strip_show', label: 'Strip Show' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ServiceCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found in this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}