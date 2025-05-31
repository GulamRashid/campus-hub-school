
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Award, Users, Building } from 'lucide-react';

const highlights = [
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Consistently achieving top results and fostering a love for learning.',
    imageHint: 'students graduation'
  },
  {
    icon: Zap,
    title: 'Modern Facilities',
    description: 'State-of-the-art labs, smart classrooms, and extensive sports infrastructure.',
    imageHint: 'science lab'
  },
  {
    icon: Users,
    title: 'Experienced Faculty',
    description: 'Dedicated and qualified educators committed to student success.',
    imageHint: 'teacher classroom'
  },
  {
    icon: Building,
    title: 'Holistic Development',
    description: 'Focus on co-curricular activities, sports, and arts for overall growth.',
    imageHint: 'students sports'
  },
];

export default function HighlightsSection() {
  return (
    <section id="highlights" className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-12">
          Why Choose Campus Hub School?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="items-center p-6">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <highlight.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-xl text-center">{highlight.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground flex-grow">
                <p>{highlight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
