
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck2 } from 'lucide-react';

export default function PublicEventsPreview() {
  return (
    <section id="events" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-12">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Annual Day Celebration', date: 'April 15, 2024', imageHint: 'stage performance' },
            { title: 'Science Fair', date: 'May 5, 2024', imageHint: 'science experiment' },
            { title: 'Summer Camp Registration', date: 'Starts May 20, 2024', imageHint: 'children playing' },
          ].map(event => (
            <Card key={event.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="items-center">
                 <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <CalendarCheck2 className="h-7 w-7 text-primary" />
                 </div>
                <CardTitle className="font-headline text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{event.date}</p>
                <p className="text-sm mt-2">More details will be available soon. Check the noticeboard or login to the ERP.</p>
              </CardContent>
            </Card>
          ))}
        </div>
         <p className="text-center mt-10 text-muted-foreground">
          (Full event calendar and RSVP features are part of the internal ERP system.)
        </p>
      </div>
    </section>
  );
}
