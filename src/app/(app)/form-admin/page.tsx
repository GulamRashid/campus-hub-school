
'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ClipboardEdit, FilePlus2, Eye, Edit, ListChecks, PowerOff, Power } from 'lucide-react';

interface ConceptualForm {
  id: string;
  title: string;
  description: string;
  status: 'Published' | 'Draft';
}

const conceptualForms: ConceptualForm[] = [
  {
    id: 'enquiry-form',
    title: 'Admission Enquiry Form',
    description: 'Standard form for prospective students to make initial enquiries. (Existing)',
    status: 'Published',
  },
  {
    id: 'event-reg-annual',
    title: 'Event Registration: Annual Day 2025',
    description: 'Form for students and parents to register for the Annual Day event.',
    status: 'Draft',
  },
  {
    id: 'feedback-survey-2024',
    title: 'Parent Feedback Survey 2024',
    description: 'Collect feedback from parents on school operations and academics.',
    status: 'Draft',
  },
];

export default function FormAdminPage(): ReactNode {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Access Denied. This page is for Administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <ClipboardEdit className="mr-3 h-8 w-8" /> Online Form Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, publish, and view submissions for various online forms.
          </p>
        </div>
        <Button disabled className="w-full sm:w-auto">
          <FilePlus2 className="mr-2 h-4 w-4" /> Create New Form (Coming Soon)
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Manage Forms</CardTitle>
          <CardDescription>
            List of existing forms. Full creation and dynamic field management will be available in future updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conceptualForms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No forms created yet. Click "Create New Form" to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conceptualForms.map((form) => (
                <Card key={form.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-headline text-lg">{form.title}</CardTitle>
                    <CardDescription className="text-xs">Status: {form.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{form.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                    <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                      <Eye className="mr-1 h-3 w-3" /> View Submissions
                    </Button>
                    <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                      <Edit className="mr-1 h-3 w-3" /> Edit Form
                    </Button>
                    {form.status === 'Draft' ? (
                         <Button variant="outline" size="sm" disabled className="w-full sm:w-auto text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                            <Power className="mr-1 h-3 w-3" /> Publish
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
                            <PowerOff className="mr-1 h-3 w-3" /> Unpublish
                        </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-primary" /> Form Builder Features (Roadmap)
          </CardTitle>
          <CardDescription>The full form builder will allow you to:</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li>Define form title and description.</li>
                <li>Add unlimited fields: Text, Number, Date, Dropdown, Radio Buttons, Checkboxes, File Upload, etc.</li>
                <li>Mark fields as mandatory or optional.</li>
                <li>Set form open and close dates/times.</li>
                <li>Add custom validation rules.</li>
                <li>Enable CAPTCHA for spam prevention.</li>
                <li>Easily publish/unpublish forms to the public website.</li>
                <li>View, search, filter, and export submitted data (CSV/Excel).</li>
                <li>Configure automated email notifications.</li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-primary">
                These advanced features are part of the future development plan for this module.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
