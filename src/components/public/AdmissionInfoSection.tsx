
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function AdmissionInfoSection() {
  return (
    <section id="admission" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-xl order-last md:order-first">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Happy Students"
              layout="fill"
              objectFit="cover"
              data-ai-hint="students smiling"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
              Admissions Open for 2024-2025
            </h2>
            <p className="text-lg text-muted-foreground">
              Join our vibrant community of learners. We offer a comprehensive curriculum from Nursery to Class 12, focusing on academic rigor and holistic development.
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground">
              <li>Streamlined online application process.</li>
              <li>Interactive assessment for new entrants.</li>
              <li>Scholarships available for meritorious students.</li>
            </ul>
            <Link href="/admission-form" passHref> {/* This page will be created later */}
              <Button size="lg" className="w-full sm:w-auto animate-pulse">
                Apply Now (Form Coming Soon)
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              For more details on the admission procedure, eligibility, and important dates, please visit our admissions office or contact us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
