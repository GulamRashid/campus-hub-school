
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import LogoIcon from '@/components/icons/LogoIcon';
import { LayoutDashboard, CalendarDays, Images, Megaphone, Settings, LogOut, GraduationCap, Users, Briefcase, DollarSign, Banknote, UserCheck, ClipboardList, BookMarked, Bus, Wand2, UserCog, Library, ShieldAlert, ClipboardEdit } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'teacher', 'student', 'parent', 'accountant', 'principal', 'librarian'] },
  { href: '/students', label: 'Students', icon: GraduationCap, allowedRoles: ['admin', 'principal', 'teacher'] },
  { href: '/teachers', label: 'Teachers', icon: Briefcase, allowedRoles: ['admin', 'principal'] },
  { href: '/timetable', label: 'Timetable', icon: CalendarDays, allowedRoles: ['admin', 'teacher', 'student', 'parent', 'principal'] },
  { href: '/exams', label: 'Exams', icon: ClipboardList, allowedRoles: ['admin', 'teacher', 'student', 'parent', 'principal'] },
  { href: '/library', label: 'Library', icon: BookMarked, allowedRoles: ['admin', 'librarian', 'teacher', 'student', 'principal'] },
  { href: '/transport', label: 'Transport', icon: Bus, allowedRoles: ['admin', 'principal'] },
  { href: '/gallery', label: 'Gallery', icon: Images, allowedRoles: ['admin', 'teacher', 'student', 'parent', 'principal', 'librarian', 'accountant'] },
  { href: '/notices', label: 'Notices', icon: Megaphone, allowedRoles: ['admin', 'teacher', 'student', 'parent', 'principal', 'librarian', 'accountant'] },
  { href: '/fees', label: 'Fees Mgt.', icon: DollarSign, allowedRoles: ['admin', 'accountant', 'principal'] }, 
  { href: '/salaries', label: 'Salaries Mgt.', icon: Banknote, allowedRoles: ['admin', 'accountant', 'principal'] }, 
  { href: '/attendance-leave', label: 'Attendance & Leave', icon: UserCheck, allowedRoles: ['admin', 'principal', 'teacher'] }, 
  { href: '/study-questions', label: 'Study Questions', icon: Wand2, allowedRoles: ['admin', 'teacher', 'student', 'principal'] },
  { href: '/form-admin', label: 'Form Admin', icon: ClipboardEdit, allowedRoles: ['admin'] },
  // Example for future admin-only settings or role management page
  // { href: '/admin/settings', label: 'System Settings', icon: UserCog, allowedRoles: ['admin'] },
  // { href: '/admin/roles', label: 'Role Management', icon: ShieldAlert, allowedRoles: ['admin'] },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => user && item.allowedRoles.includes(user.role));

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex items-center gap-2 justify-start group-data-[collapsible=icon]:justify-center">
        <LogoIcon className="h-8 w-8 text-sidebar-primary-foreground" />
        <h2 className="font-headline text-2xl font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">
          Campus Hub
        </h2>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "font-body" }}
                  className="justify-start group-data-[collapsible=icon]:justify-center"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
         {user && (
          <div className="flex flex-col items-start p-2 gap-1 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#" passHref legacyBehavior>
              <SidebarMenuButton
                tooltip={{ children: "Settings", className: "font-body" }}
                className="justify-start group-data-[collapsible=icon]:justify-center"
              >
                <Settings className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip={{ children: "Logout", className: "font-body" }}
              className="justify-start group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
