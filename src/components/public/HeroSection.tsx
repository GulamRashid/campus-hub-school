
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="hero" className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary tracking-tight">
              Welcome to Campus Hub School
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Nurturing minds, shaping futures. Our mission is to provide a stimulating learning environment that encourages intellectual curiosity and personal growth.
            </p>
            <p className="text-md text-foreground">
              Vision: To be a center of excellence in education, fostering leaders and innovators of tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="#admission" passHref>
                <Button size="lg" className="w-full sm:w-auto">Explore Admissions</Button>
              </Link>
              <Link href="#contact" passHref>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Contact Us</Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="https://placehold.co/800x600.png"
              alt="School Campus"
              layout="fill"
              objectFit="cover"
              className="transform transition-transform duration-500 hover:scale-105"
              data-ai-hint="school building students"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
