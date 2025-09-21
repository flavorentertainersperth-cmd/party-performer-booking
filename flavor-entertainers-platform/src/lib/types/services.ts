// Service Types for Flavor Entertainers Platform

export type ServiceCategory = 'waitressing' | 'lap_dance' | 'strip_show';

export type RateType = 'per_hour' | 'flat_rate' | 'per_person';

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  base_rate: number;
  rate_type: RateType;
  min_duration_minutes: number;
  booking_notes: string;
  is_private_only: boolean;
  age_restricted: boolean;
  requires_special_license: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PerformerService {
  id: string;
  performer_id: string;
  service_id: string;
  custom_rate?: number;
  is_available: boolean;
  special_notes?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface ServiceWithDetails extends Service {
  performer_count?: number;
  avg_rate?: number;
  min_rate?: number;
  max_rate?: number;
}

export interface PerformerServiceDetailed {
  service_id: string;
  service_name: string;
  category: ServiceCategory;
  description: string;
  rate: number;
  rate_type: RateType;
  min_duration_minutes: number;
  booking_notes: string;
  is_private_only: boolean;
  age_restricted: boolean;
  special_notes?: string;
}

// Service Category Display Names
export const SERVICE_CATEGORY_NAMES: Record<ServiceCategory, string> = {
  waitressing: 'Waitressing',
  lap_dance: 'Lap Dance',
  strip_show: 'Strip Show'
};

// Rate Type Display Names
export const RATE_TYPE_NAMES: Record<RateType, string> = {
  per_hour: 'Per Hour',
  flat_rate: 'Flat Rate',
  per_person: 'Per Person'
};

// Service Category Descriptions
export const SERVICE_CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  waitressing: 'Professional serving and hospitality services for events and venues',
  lap_dance: 'Intimate dance performances for private entertainment',
  strip_show: 'Adult entertainment performances with various themes and styles'
};

// Utility functions
export const formatRate = (rate: number, type: RateType): string => {
  if (rate === 0) return 'Enquire for pricing';

  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rate);

  switch (type) {
    case 'per_hour':
      return `${formatted}/hr`;
    case 'per_person':
      return `${formatted}/person`;
    case 'flat_rate':
    default:
      return formatted;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const getServiceIcon = (category: ServiceCategory): string => {
  switch (category) {
    case 'waitressing':
      return '🍸';
    case 'lap_dance':
      return '💃';
    case 'strip_show':
      return '🎭';
    default:
      return '⭐';
  }
};

export const getServiceColor = (category: ServiceCategory): string => {
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

// Service validation
export const isAgeRestrictedService = (service: Service | PerformerServiceDetailed): boolean => {
  return 'age_restricted' in service ? service.age_restricted : false;
};

export const isPrivateOnlyService = (service: Service | PerformerServiceDetailed): boolean => {
  return service.is_private_only;
};

// Booking calculation helpers
export const calculateServiceCost = (
  service: PerformerServiceDetailed,
  duration: number, // in minutes
  personCount: number = 1
): number => {
  switch (service.rate_type) {
    case 'per_hour':
      const hours = Math.max(duration / 60, service.min_duration_minutes / 60);
      return service.rate * hours;

    case 'per_person':
      return service.rate * personCount;

    case 'flat_rate':
    default:
      return service.rate;
  }
};

export const getMinimumBookingCost = (service: PerformerServiceDetailed): number => {
  return calculateServiceCost(service, service.min_duration_minutes, 1);
};