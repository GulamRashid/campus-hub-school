
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Users, GraduationCap, Edit, Trash2, ArrowUpCircle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO as dateFnsParseISO, isValid } from 'date-fns';

interface Student {
  id: string;
  name: string;
  className: string; 
  section: string;
  admissionDate: string; 
  rollNumber?: string;
  dateOfBirth?: string; // ISO Date string
  gender?: 'Male' | 'Female' | 'Other';
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
}

const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  className: z.string().min(1, { message: 'Class is required.' }),
  section: z.string().min(1, { message: 'Section is required.' }).max(2, {message: 'Section should be a single character like A, B.'}),
  admissionDate: z.string().refine((date) => isValid(dateFnsParseISO(date)), { message: 'Invalid admission date.'}),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().optional().refine(val => !val || isValid(dateFnsParseISO(val)), { message: 'Invalid date of birth.'}),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional().refine(val => !val || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val) || val.length >= 7, {
    message: "Invalid phone number format (min 7 digits)"
  }),
  address: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const initialStudents: Student[] = [
  { id: 'S1001', name: 'Alice Johnson', className: '10', section: 'A', admissionDate: '2023-04-15', rollNumber: '10A01', dateOfBirth: '2008-03-10', gender: 'Female', guardianName: 'John Johnson', guardianPhone: '555-1111', address: '123 Main St, Anytown' },
  { id: 'S1002', name: 'Bob Williams', className: '9', section: 'B', admissionDate: '2023-05-01', rollNumber: '09B05', dateOfBirth: '2009-07-22', gender: 'Male', guardianName: 'Sarah Williams', guardianPhone: '555-2222', address: '456 Oak Ave, Anytown' },
  { id: 'S1003', name: 'Charlie Brown', className: '11', section: 'C', admissionDate: '2022-08-20', rollNumber: '11C12', dateOfBirth: '2007-01-15', gender: 'Male', guardianName: 'James Brown', guardianPhone: '555-3333', address: '789 Pine Ln, Anytown' },
  { id: 'S1004', name: 'Diana Miller', className: 'NC', section: 'A', admissionDate: '2024-03-01', rollNumber: 'NCA03', dateOfBirth: '2020-05-01', gender: 'Female', guardianName: 'Laura Miller', guardianPhone: '555-4444', address: '321 Maple Dr, Anytown' },
  { id: 'S1005', name: 'Edward Davis', className: '12', section: 'B', admissionDate: '2021-07-10', rollNumber: '12B08', dateOfBirth: '2006-11-30', gender: 'Male', guardianName: 'Robert Davis', guardianPhone: '555-5555', address: '654 Willow Rd, Anytown' },
  { id: 'S1006', name: 'Fiona Garcia', className: 'Graduated', section: 'A', admissionDate: '2020-06-01', rollNumber: 'GRADA01', dateOfBirth: '2002-09-05', gender: 'Female', guardianName: 'Maria Garcia', guardianPhone: '555-6666', address: '987 Birch Ct, Anytown'},
].sort((a,b) => a.name.localeCompare(b.name));

const CLASS_FILTER_OPTIONS = ["All", "NC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Graduated"];
const CLASS_FORM_OPTIONS = ["NC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const GENDER_OPTIONS: Student['gender'][] = ['Male', 'Female', 'Other'];


export default function StudentManagementPage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [classFilter, setClassFilter] = useState<string>("All");

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      className: '',
      section: '',
      admissionDate: new Date().toISOString().split('T')[0],
      rollNumber: '',
      dateOfBirth: '',
      gender: undefined,
      guardianName: '',
      guardianPhone: '',
      address: '',
    },
  });

  const resetFormFields = (studentData?: Partial<StudentFormValues>) => {
    form.reset({
        name: studentData?.name || '',
        className: studentData?.className || '',
        section: studentData?.section || '',
        admissionDate: studentData?.admissionDate ? studentData.admissionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        rollNumber: studentData?.rollNumber || '',
        dateOfBirth: studentData?.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
        gender: studentData?.gender || undefined,
        guardianName: studentData?.guardianName || '',
        guardianPhone: studentData?.guardianPhone || '',
        address: studentData?.address || '',
    });
  };

  useEffect(() => {
    if (editingStudent) {
      resetFormFields(editingStudent);
    } else {
      resetFormFields();
    }
  }, [editingStudent, form, showStudentModal]);

  const filteredStudents = useMemo(() => {
    if (classFilter === "All") {
      return students;
    }
    return students.filter(student => student.className === classFilter);
  }, [students, classFilter]);

  const handleFormSubmit = (values: StudentFormValues) => {
    if (editingStudent) {
      setStudents(prevStudents =>
        prevStudents.map(s =>
          s.id === editingStudent.id ? { ...s, ...values, section: values.section.toUpperCase() } : s
        ).sort((a,b) => a.name.localeCompare(b.name))
      );
      toast({
        title: 'Student Updated',
        description: `${values.name}'s details have been successfully updated.`,
      });
    } else {
      const newStudent: Student = {
        id: `S${Date.now().toString().slice(-4)}`,
        ...values,
        section: values.section.toUpperCase(),
      };
      setStudents(prevStudents => [...prevStudents, newStudent].sort((a,b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Student Added',
        description: `${values.name} has been successfully added.`,
      });
    }
    setShowStudentModal(false);
    setEditingStudent(null);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    resetFormFields();
    setShowStudentModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      setStudents(prevStudents => prevStudents.filter(s => s.id !== studentToDelete.id).sort((a,b) => a.name.localeCompare(b.name)));
      toast({
        title: 'Student Deleted',
        description: `${studentToDelete.name} has been removed.`,
        variant: 'destructive'
      });
      setStudentToDelete(null);
    }
  };

  const handlePromoteStudent = (studentId: string) => {
    setStudents(prevStudents =>
      prevStudents.map(s => {
        if (s.id === studentId) {
          let nextClass = s.className;
          if (s.className === "NC") nextClass = "1";
          else if (s.className === "12") nextClass = "Graduated";
          else if (!isNaN(Number(s.className)) && Number(s.className) < 12 && CLASS_FORM_OPTIONS.includes(s.className)) { 
            nextClass = (Number(s.className) + 1).toString();
          }
          
          if (nextClass !== s.className) {
             toast({
              title: 'Student Promoted',
              description: `${s.name} has been promoted to Class ${nextClass}.`,
            });
          } else if (s.className !== "Graduated") { 
            toast({
              title: 'Promotion Not Applicable',
              description: `${s.name} is already in the highest class or status.`,
              variant: "default" 
            });
          }
          return { ...s, className: nextClass };
        }
        return s;
      }).sort((a,b) => a.name.localeCompare(b.name))
    );
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <GraduationCap className="mr-3 h-8 w-8" /> Student Management
          </h1>
          <p className="text-muted-foreground">
            View, add, edit, promote, and manage student records.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by class..." />
            </SelectTrigger>
            <SelectContent>
              {CLASS_FILTER_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option === "All" ? "All Classes" : `Class ${option}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.role === 'admin' && (
            <Button onClick={openAddModal} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={showStudentModal} onOpenChange={(isOpen) => {
        setShowStudentModal(isOpen);
        if (!isOpen) setEditingStudent(null);
      }}>
        <DialogContent className="sm:max-w-2xl"> {/* Increased width for more fields */}
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingStudent ? 'Edit Student Details' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {editingStudent ? "Update the student's information below." : "Fill in the details to register a new student."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="className"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASS_FORM_OPTIONS.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A, B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10A01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ? field.value.split('T')[0] : ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ? field.value.split('T')[0] : ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_OPTIONS.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter guardian's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter guardian's phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter student's address" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2 sticky bottom-0 bg-background py-4 border-t">
                <Button type="button" variant="outline" onClick={() => {
                  setShowStudentModal(false);
                  setEditingStudent(null);
                }} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">{editingStudent ? 'Save Changes' : 'Add Student'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!studentToDelete} onOpenChange={(isOpen) => { if(!isOpen) setStudentToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {studentToDelete?.name}'s record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Student List</CardTitle>
          <CardDescription>Currently enrolled students. {classFilter !== "All" && `(Class ${classFilter})`}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Students Found</p>
              <p>{classFilter === "All" ? "Start by adding students to the system." : `No students found for Class ${classFilter}.`}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Guardian</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>{student.rollNumber || '-'}</TableCell>
                      <TableCell>{student.admissionDate ? format(dateFnsParseISO(student.admissionDate), 'PPP') : '-'}</TableCell>
                      <TableCell>{student.guardianName || '-'}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePromoteStudent(student.id)}
                            disabled={student.className === 'Graduated'}
                            title={student.className === 'Graduated' ? "Cannot promote graduated student" : "Promote to next class"}
                            className="w-full sm:w-auto"
                          >
                            <ArrowUpCircle className="mr-1 h-3 w-3" /> Promote
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditModal(student)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setStudentToDelete(student)} className="w-full sm:w-auto">
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

