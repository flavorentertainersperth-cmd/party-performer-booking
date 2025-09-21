'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/types/services';

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

export function ServiceCategoryCard({
  category,
  title,
  description,
  icon,
  gradient
}: ServiceCategoryCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        <Link href={`/services/${category}`}>
          <Button
            variant="outline"
            className="group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
          >
            View Services
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}