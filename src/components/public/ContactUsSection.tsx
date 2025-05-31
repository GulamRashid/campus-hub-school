
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUsSection() {
  return (
    <section id="contact" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center text-primary mb-12">
          Get In Touch
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold font-headline text-primary mb-2 flex items-center">
                <MapPin className="mr-3 h-6 w-6" /> Our Address
              </h3>
              <p className="text-muted-foreground">
                Campus Hub School<br />
                123 Education Lane, Knowledge City<br />
                Techville, ST 54321
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold font-headline text-primary mb-2 flex items-center">
                <Phone className="mr-3 h-6 w-6" /> Phone
              </h3>
              <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                +1 (234) 567-890
              </a>
            </div>
            <div>
              <h3 className="text-xl font-semibold font-headline text-primary mb-2 flex items-center">
                <Mail className="mr-3 h-6 w-6" /> Email
              </h3>
              <a href="mailto:info@campushubschool.example.com" className="text-muted-foreground hover:text-primary transition-colors">
                info@campushubschool.example.com
              </a>
            </div>
             <p className="text-sm text-muted-foreground pt-4">
              Office Hours: Monday - Friday, 9:00 AM - 5:00 PM
            </p>
          </div>
          <div className="h-80 md:h-full bg-muted rounded-lg shadow-md flex items-center justify-center">
            {/* Placeholder for Google Maps Embed */}
            <p className="text-foreground p-4">
              Google Maps iframe embed would go here. <br/>
              Example: &lt;iframe src=&quot;https://www.google.com/maps/embed?pb=...!&quot; ...&gt;&lt;/iframe&gt;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
