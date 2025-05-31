
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Link2 } from 'lucide-react';

interface ConceptualFormLink {
  id: string;
  title: string;
  description: string;
  href?: string;
  sectionId?: string; // For linking to sections on the same page
  status: 'Active' | 'Coming Soon';
  icon: React.ElementType;
}

const conceptualForms: ConceptualFormLink[] = [
  {
    id: 'admission-enquiry',
    title: 'Admission Enquiry',
    description: 'Have questions about admissions? Submit an enquiry.',
    sectionId: 'enquiry', // Links to #enquiry section on the homepage
    status: 'Active',
    icon: FileText,
  },
  {
    id: 'science-fair-reg',
    title: 'Science Fair Registration 2025',
    description: 'Register your project for the upcoming annual Science Fair.',
    href: '#', // Placeholder link
    status: 'Coming Soon',
    icon: FileText,
  },
  {
    id: 'alumni-signup',
    title: 'Alumni Network Signup',
    description: 'Join our alumni network to stay connected and receive updates.',
    href: '#', // Placeholder link
    status: 'Coming Soon',
    icon: Link2,
  },
];

export default function ActiveFormsSection() {
  return (
    <section id="active-forms" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">
            Online Forms & Applications
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Access various online forms and applications here.
          </p>
        </div>

        {conceptualForms.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No active forms available at the moment. Please check back later.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {conceptualForms.map((form) => {
              const cardContent = (
                <Card key={form.id} className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                        <form.icon className="h-8 w-8 text-primary mb-3" />
                        {form.status === 'Coming Soon' && (
                             <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
                        )}
                    </div>
                    <CardTitle className="font-headline text-xl">{form.title}</CardTitle>
                    <CardDescription>{form.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Additional content can go here if needed */}
                  </CardContent>
                  <CardFooter>
                    <Button
                      disabled={form.status === 'Coming Soon'}
                      className="w-full"
                      asChild={form.status === 'Active' && (form.href || form.sectionId)}
                    >
                      {form.href && form.status === 'Active' ? (
                        <Link href={form.href}>Open Form</Link>
                      ) : form.sectionId && form.status === 'Active' ? (
                        <Link href={`#${form.sectionId}`}>Go to Section</Link>
                      ) : form.status === 'Coming Soon' ? (
                        'Coming Soon'
                      ) : (
                        'Open Form'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );

              if (form.status === 'Active' && (form.href || form.sectionId)) {
                // No specific wrapper needed if we use asChild on Button for Link
                return cardContent;
              }
              return cardContent; // Render card directly if not active or no link
            })}
          </div>
        )}
      </div>
    </section>
  );
}
