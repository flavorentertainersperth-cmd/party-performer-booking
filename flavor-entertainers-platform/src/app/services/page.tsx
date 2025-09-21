import { Metadata } from 'next';
import { ServiceCategoryCard } from '@/components/services/service-category-card';
import { ServiceGrid } from '@/components/services/service-grid';
import type { ServiceCategory } from '@/lib/types/services';

export const metadata: Metadata = {
  title: 'Services - Flavor Entertainers',
  description: 'Browse our comprehensive range of professional entertainment services including waitressing, lap dance, and strip show performances.',
};

const serviceCategories: Array<{
  category: ServiceCategory;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}> = [
  {
    category: 'waitressing',
    title: 'Waitressing Services',
    description: 'Professional serving and hospitality services for events and venues',
    icon: '🍸',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    category: 'lap_dance',
    title: 'Lap Dance',
    description: 'Intimate dance performances for private entertainment',
    icon: '💃',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    category: 'strip_show',
    title: 'Strip Show',
    description: 'Adult entertainment performances with various themes and styles',
    icon: '🎭',
    gradient: 'from-pink-500 to-pink-600'
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover our comprehensive range of professional entertainment services.
            All performers are thoroughly vetted and verified for your peace of mind.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Professional Performers
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Fully Insured
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Background Checked
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              Licensed Venues
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {serviceCategories.map((category) => (
              <ServiceCategoryCard
                key={category.category}
                category={category.category}
                title={category.title}
                description={category.description}
                icon={category.icon}
                gradient={category.gradient}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Service Catalog
            </h2>
            <p className="text-lg text-gray-600">
              Browse all available services with detailed pricing and descriptions
            </p>
          </div>

          <ServiceGrid />
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Important Information
            </h3>
            <div className="text-left space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-red-500 mt-1">⚠️</span>
                <p>
                  <strong>Age Restrictions:</strong> Many services are restricted to 18+ venues and events.
                  Age verification is required for adult entertainment services.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">📍</span>
                <p>
                  <strong>Venue Requirements:</strong> Some services require licensed venues or private events only.
                  Please check individual service requirements.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✅</span>
                <p>
                  <strong>Professional Standards:</strong> All performers maintain the highest standards of
                  professionalism and respect for client boundaries.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">💰</span>
                <p>
                  <strong>Custom Rates:</strong> Individual performers may offer custom rates.
                  Contact performers directly for personalized quotes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}