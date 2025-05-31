
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
} from '@/components/ui/card';
import { Bus, Map, Users2, CalendarCheck2, Wrench, FileText } from 'lucide-react';

export default function TransportManagementPage(): ReactNode {
  const { user } = useAuth();

  // In a real application, data for vehicles, routes, etc., would be fetched.
  // For now, we'll just have placeholders.

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Bus className="mr-3 h-8 w-8" /> Transport Management
          </h1>
          <p className="text-muted-foreground">
            Manage vehicles, routes, drivers, student transport, and maintenance.
          </p>
        </div>
        {/* Future: Add button for a primary action like "Add New Vehicle" or "Schedule Route" */}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Bus className="mr-2 h-5 w-5 text-primary" /> Vehicle Management
            </CardTitle>
            <CardDescription>Manage school transport vehicles.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Add, edit, and view details of buses and other transport vehicles. Track registration, insurance, and capacity.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                Manage Vehicles (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Map className="mr-2 h-5 w-5 text-primary" /> Route Management
            </CardTitle>
            <CardDescription>Define and manage transport routes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Create, update, and assign routes with designated stops and timings. Assign vehicles to routes.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                Manage Routes (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Users2 className="mr-2 h-5 w-5 text-primary" /> Driver & Helper Management
            </CardTitle>
            <CardDescription>Manage transport staff.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Maintain records of drivers and helpers, including contact details, licenses, and assigned vehicles/routes.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                Manage Staff (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <CalendarCheck2 className="mr-2 h-5 w-5 text-primary" /> Student Pickup/Drop
            </CardTitle>
            <CardDescription>Schedule and track student transport.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Assign students to routes and stops. Manage pickup and drop schedules and attendance.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                Manage Schedules (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-primary" /> Maintenance Records
            </CardTitle>
            <CardDescription>Track vehicle maintenance.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Log and monitor vehicle servicing, repairs, and upcoming maintenance schedules.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                View Records (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Transport Fee Reports
            </CardTitle>
            <CardDescription>Generate fee-related reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              View and export reports related to transport fees, collections, and student lists per route.
            </p>
            {user?.role === 'admin' && (
              <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>
                Generate Reports (Coming Soon)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Parent Notifications</CardTitle>
            <CardDescription>Functionality for notifying parents about transport delays or route changes will be managed here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-6 text-center">
                (Coming Soon)
            </p>
          </CardContent>
        </Card>

    </div>
  );
}

