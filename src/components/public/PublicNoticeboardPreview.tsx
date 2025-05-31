
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Megaphone, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

// Static mock data for preview
const sampleNotices = [
  { id: 'pub1', title: 'Annual Sports Day Rescheduled', content: 'The Annual Sports Day will now be held on March 25th. All students are requested to note the change.', issuedDate: new Date('2024-03-10'), type: 'Event' },
  { id: 'pub2', title: 'Parent-Teacher Meeting - Junior Wing', content: 'PTM for classes Nursery to V will be on March 18th. Please book your slots.', issuedDate: new Date('2024-03-08'), type: 'Academic' },
  { id: 'pub3', title: 'Science Exhibition Entries Open', content: 'Submit your projects for the upcoming Science Exhibition by April 5th.', issuedDate: new Date('2024-03-05'), type: 'Event' },
];

export default function PublicNoticeboardPreview() {
  return (
    <section id="notices" className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-12">
          Latest Notices & Announcements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleNotices.map((notice) => (
            <Card key={notice.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="font-headline text-lg">{notice.title}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{notice.type}</span>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Posted on: {format(notice.issuedDate, 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-foreground flex-grow">
                <p className="line-clamp-3">{notice.content}</p>
              </CardContent>
              <div className="p-4 pt-0">
                {/* In a real app, this would link to a full notice page */}
                <Button variant="link" className="p-0 h-auto text-primary">Read More</Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/login" passHref> {/* Or a dedicated public notices page if created */}
            <Button variant="outline" size="lg">View All Notices in ERP</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
