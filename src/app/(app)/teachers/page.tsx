
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Users, Briefcase, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone?: string;
}

const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().optional().refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), {
    message: "Invalid phone number format"
  }),
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

const initialTeachers: Teacher[] = [
  { id: 'T2001', name: 'Dr. Eleanor Vance', subject: 'Physics', email: 'eleanor.vance@example.com', phone: '555-0101' },
  { id: 'T2002', name: 'Mr. Samuel Green', subject: 'Mathematics', email: 'samuel.green@example.com', phone: '555-0102' },
  { id: 'T2003', name: 'Ms. Olivia Chen', subject: 'Chemistry', email: 'olivia.chen@example.com' },
  { id: 'T2004', name: 'Mr. David Lee', subject: 'History', email: 'david.lee@example.com', phone: '555-0104' },
].sort((a,b) => a.name.localeCompare(b.name));


export default function TeacherManagementPage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (editingTeacher) {
      form.reset(editingTeacher);
    } else {
      form.reset({ name: '', subject: '', email: '', phone: '' });
    }
  }, [editingTeacher, form, showTeacherModal]);

  const handleFormSubmit = (values: TeacherFormValues) => {
    if (editingTeacher) {
      setTeachers(prevTeachers =>
        prevTeachers.map(t =>
          t.id === editingTeacher.id ? { ...t, ...values } : t
        ).sort((a,b) => a.name.localeCompare(b.name))
      );
      toast({
        title: 'Teacher Updated',
        description: `${values.name}'s details have been successfully updated.`,
      });
    } else {
      const newTeacher: Teacher = {
        id: `T${Date.now().toString().slice(-4)}`,
        ...values,
      };
      setTeachers(prevTeachers => [newTeacher, ...prevTeachers].sort((a,b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Teacher Added',
        description: `${values.name} has been successfully added.`,
      });
    }
    setShowTeacherModal(false);
    setEditingTeacher(null);
    form.reset();
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    form.reset({ name: '', subject: '', email: '', phone: '' });
    setShowTeacherModal(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleDeleteConfirm = () => {
    if (teacherToDelete) {
      setTeachers(prevTeachers => prevTeachers.filter(t => t.id !== teacherToDelete.id));
      toast({
        title: 'Teacher Deleted',
        description: `${teacherToDelete.name} has been removed.`,
        variant: 'destructive'
      });
      setTeacherToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Briefcase className="mr-3 h-8 w-8" /> Teacher Management
          </h1>
          <p className="text-muted-foreground">
            View, add, edit, and manage teacher records.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
          </Button>
        )}
      </div>
      
      <Dialog open={showTeacherModal} onOpenChange={(isOpen) => {
        setShowTeacherModal(isOpen);
        if (!isOpen) setEditingTeacher(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingTeacher ? 'Edit Teacher Details' : 'Add New Teacher'}
            </DialogTitle>
            <DialogDescription>
              {editingTeacher ? "Update the teacher's information below." : "Fill in the details to register a new teacher."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter teacher's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mathematics, Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="teacher@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowTeacherModal(false);
                  setEditingTeacher(null);
                }} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">{editingTeacher ? 'Save Changes' : 'Add Teacher'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!teacherToDelete} onOpenChange={(isOpen) => { if(!isOpen) setTeacherToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {teacherToDelete?.name}'s record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeacherToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Teacher List</CardTitle>
          <CardDescription>Current teaching staff.</CardDescription>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Teachers Found</p>
              <p>Start by adding teachers to the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.id}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone || '-'}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(teacher)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setTeacherToDelete(teacher)} className="w-full sm:w-auto">
                             <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
