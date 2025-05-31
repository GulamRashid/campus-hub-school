
'use client';

import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, BookOpen, ShieldCheck, Megaphone, CalendarDays, Settings, DollarSign, LibraryIcon, Briefcase, Banknote, UserCheckIcon, ClipboardCheckIcon, FileWarningIcon, GraduationCap } from 'lucide-react';
import Image from 'next/image';

// Mock data imports for Admin Dashboard Metrics - In a real app, this data would come from API/state management
// For simplicity, we assume these pages might export their mock data or we use static counts
// This is a conceptual demonstration. Direct import might cause issues if these files have 'use client' and complex state.
const MOCK_TOTAL_STUDENTS = 250; // Example static count
const MOCK_TOTAL_TEACHERS = 25;  // Example static count
const MOCK_ACTIVE_NOTICES = 5;   // Example static count
const MOCK_PENDING_LEAVE = 3;    // Example static count


interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  imageUrl?: string;
  imageHint?: string;
  link?: string;
  metricValue?: string | number;
  metricLabel?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon: Icon, imageUrl, imageHint, link, metricValue, metricLabel }) => {
  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        {imageUrl && !metricValue && ( // Only show image if no metric is present
           <div className="mb-4 h-40 w-full overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={title}
              width={400}
              height={200}
              className="object-cover h-full w-full"
              data-ai-hint={imageHint || "abstract background"}
            />
          </div>
        )}
        {metricValue !== undefined && (
          <div className="mb-3">
            <div className="text-4xl font-bold text-primary">{metricValue}</div>
            {metricLabel && <p className="text-xs text-muted-foreground">{metricLabel}</p>}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </>
  );

  const cardClasses = "shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col";

  if (link) {
    return (
      <a href={link} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
        <Card className={cardClasses}>
          {cardContent}
        </Card>
      </a>
    );
  }

  return (
    <Card className={cardClasses}>
      {cardContent}
    </Card>
  );
};

const AdminDashboard = () => (
  <>
    <DashboardCard
      title="Total Students"
      description="Current student enrollment across all classes."
      icon={Users}
      metricValue={MOCK_TOTAL_STUDENTS}
      metricLabel="Students Enrolled"
      link="/students"
    />
    <DashboardCard
      title="Total Teachers"
      description="Current teaching staff count."
      icon={Briefcase}
      metricValue={MOCK_TOTAL_TEACHERS}
      metricLabel="Faculty Members"
      link="/teachers"
    />
    <DashboardCard
      title="Active Notices"
      description="Important announcements currently live."
      icon={Megaphone}
      metricValue={MOCK_ACTIVE_NOTICES}
      metricLabel="Active Announcements"
      link="/notices"
    />
    <DashboardCard
      title="Pending Leave Requests"
      description="Leave applications awaiting approval."
      icon={FileWarningIcon}
      metricValue={MOCK_PENDING_LEAVE}
      metricLabel="Requests Awaiting Action"
      link="/attendance-leave"
    />
    <DashboardCard
      title="User Management"
      description="Manage all user accounts (teachers, students, parents, etc.)."
      icon={Users}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="team management"
      // link="/admin/users" // Example future link
    />
    <DashboardCard
      title="System Settings"
      description="Configure global settings for Campus Hub (e.g., roles, permissions - conceptual)."
      icon={Settings}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="system gears"
       // link="/admin/settings" // Example future link
    />
     <DashboardCard
      title="Overall Analytics"
      description="View school-wide statistics and performance metrics."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="analytics chart"
    />
  </>
);

const TeacherDashboard = () => (
  <>
    <DashboardCard
      title="My Classes"
      description="Access your class schedules, student lists, and assignments."
      icon={BookOpen}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="classroom teacher"
    />
    <DashboardCard
      title="Gradebook"
      description="Manage and submit student grades."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="grading papers"
    />
    <DashboardCard
      title="Announcements"
      description="Post announcements for your students."
      icon={Megaphone}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="communication megaphone"
    />
     <DashboardCard
      title="My Salary"
      description="View your salary slips and payment history (Conceptual)."
      icon={DollarSign}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="money payment"
    />
  </>
);

const StudentDashboard = () => (
  <>
    <DashboardCard
      title="My Courses"
      description="View your enrolled courses, materials, and upcoming assignments."
      icon={BookOpen}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="student studying"
    />
    <DashboardCard
      title="My Grades"
      description="Check your academic performance and grades."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="report card"
    />
    <DashboardCard
      title="School Timetable"
      description="Access your personalized class schedule."
      icon={CalendarDays}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="calendar schedule"
      link="/timetable"
    />
     <DashboardCard
      title="My Fee Status"
      description="Check your outstanding fees and payment history (Conceptual)."
      icon={DollarSign}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="financial document"
    />
  </>
);

const ParentDashboard = () => (
  <>
    <DashboardCard
      title="Child's Progress"
      description="Monitor your child's academic performance and attendance."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="child learning"
    />
    <DashboardCard
      title="School Notices"
      description="Stay updated with important announcements from the school."
      icon={Megaphone}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="school announcement"
      link="/notices"
    />
    <DashboardCard
      title="Teacher Communication"
      description="Communicate with your child's teachers (Conceptual)."
      icon={Users}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="parent teacher meeting"
    />
    <DashboardCard
      title="Child's Fee Status"
      description="View your child's fee payment status and history (Conceptual)."
      icon={DollarSign}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="money transaction"
    />
  </>
);

const AccountantDashboard = () => (
  <>
    <DashboardCard
      title="Fee Management"
      description="Manage fee structures, track student payments, and generate reports."
      icon={DollarSign}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="accounting ledger"
      link="/fees"
    />
    <DashboardCard
      title="Salary Processing"
      description="Process teacher salaries, manage deductions, and view payment history."
      icon={Banknote}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="payroll money"
      link="/salaries"
    />
    <DashboardCard
      title="Financial Reports"
      description="Generate various financial statements and reports (Conceptual)."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="financial graph"
    />
  </>
);

const PrincipalDashboard = () => (
  <>
    <DashboardCard
      title="School Overview"
      description="View key metrics, academic performance, and staff activity."
      icon={BarChart}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="school building"
    />
    <DashboardCard
      title="Staff Management"
      description="Oversee teacher and staff records, performance, and assignments."
      icon={Users}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="leadership team"
      link="/teachers"
    />
    <DashboardCard
      title="Academic Planning"
      description="Plan academic year, curriculum, and school events."
      icon={CalendarDays}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="planning calendar"
    />
     <DashboardCard
      title="Student Management"
      description="Access and manage student records and admissions."
      icon={GraduationCap}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="student records"
      link="/students"
    />
  </>
);

const LibrarianDashboard = () => (
  <>
    <DashboardCard
      title="Library Catalog"
      description="Manage book inventory, add new books, and track copies."
      icon={LibraryIcon}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="library books"
      link="/library"
    />
    <DashboardCard
      title="Book Issue/Return"
      description="Track borrowed books, manage due dates, and handle returns."
      icon={BookOpen}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="book checkout"
    />
    <DashboardCard
      title="Member Management"
      description="Manage library member profiles and borrowing history."
      icon={Users}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="library users"
    />
  </>
);

const DefaultDashboard = () => (
    <DashboardCard
      title="Welcome!"
      description="Your personalized dashboard is being set up. Please check back later or contact administration if you believe this is an error."
      icon={Settings}
      imageUrl="https://placehold.co/600x400.png"
      imageHint="under construction"
    />
);


const roleDashboards: Record<UserRole, React.FC | undefined> = {
  admin: AdminDashboard,
  teacher: TeacherDashboard,
  student: StudentDashboard,
  parent: ParentDashboard,
  accountant: AccountantDashboard,
  principal: PrincipalDashboard,
  librarian: LibrarianDashboard,
};

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user data...</p>; // Or a loading skeleton
  }

  const RoleSpecificDashboard = roleDashboards[user.role] || DefaultDashboard;

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b">
        <h1 className="text-3xl font-bold font-headline text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your personalized overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <RoleSpecificDashboard />
      </div>
    </div>
  );
}
