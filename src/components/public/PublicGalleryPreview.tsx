
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';

// Temporary: Using initialGalleryItems from gallery page for preview
// In a real app, this data would be fetched from a public API endpoint.
const initialGalleryItems = [
  { id: '1', title: 'Annual Sports Day', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'sports children', date: '2024-03-15', eventTag: 'Sports' },
  { id: '2', title: 'Science Fair Exhibition', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'science experiment', date: '2024-04-22', eventTag: 'Academics' },
  { id: '3', title: 'Art & Craft Workshop', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'art craft', date: '2024-05-10', eventTag: 'Workshop' },
  { id: '4', title: 'Graduation Ceremony', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'graduation students', date: '2024-06-01', eventTag: 'Ceremony' },
];

const previewItems = initialGalleryItems.slice(0, 4); // Show up to 4 items

export default function PublicGalleryPreview() {
  return (
    <section id="gallery-preview" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Campus Moments</h2>
          <p className="text-lg text-muted-foreground mt-2">A glimpse into life at Campus Hub School.</p>
        </div>

        {previewItems.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ImageIcon className="mx-auto h-16 w-16 opacity-50 mb-4" />
            <p className="text-lg">Our gallery is currently empty. Check back soon for exciting moments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {previewItems.map((item) => (
              <div key={item.id} className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="relative aspect-video">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.imageHint}
                  />
                   {item.eventTag && (
                    <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-md">
                      {item.eventTag}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-card">
                  <h3 className="font-semibold text-lg font-headline text-card-foreground truncate group-hover:text-primary">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10 md:mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
