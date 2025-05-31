
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Edit, Trash2, Banknote, Calculator, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  month: number; // 1-12
  year: number;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate?: string; // ISO if paid
}

// Sample teacher data (in a real app, this would come from a teacher management module/API)
const sampleTeachersForSalary = [
  { id: 'T2001', name: 'Dr. Eleanor Vance' },
  { id: 'T2002', name: 'Mr. Samuel Green' },
  { id: 'T2003', name: 'Ms. Olivia Chen' },
  { id: 'T2004', name: 'Mr. David Lee' },
];

const salaryRecordFormSchema = z.object({
  teacherId: z.string().min(1, { message: 'Teacher is required.' }),
  month: z.coerce.number().min(1).max(12, { message: 'Month must be between 1 and 12.' }),
  year: z.coerce.number().min(new Date().getFullYear() - 5).max(new Date().getFullYear() + 1, { message: `Year must be between ${new Date().getFullYear() - 5} and ${new Date().getFullYear() + 1}.`}),
  basicSalary: z.coerce.number().positive({ message: 'Basic salary must be positive.' }),
  totalAllowances: z.coerce.number().min(0, { message: 'Allowances cannot be negative.' }),
  totalDeductions: z.coerce.number().min(0, { message: 'Deductions cannot be negative.' }),
  paymentStatus: z.enum(['Paid', 'Pending']),
});

type SalaryRecordFormValues = z.infer<typeof salaryRecordFormSchema>;

const initialSalaryRecords: SalaryRecord[] = [
  { id: 'SR1', teacherId: 'T2001', teacherName: 'Dr. Eleanor Vance', month: 6, year: 2024, basicSalary: 50000, totalAllowances: 5000, totalDeductions: 2000, netSalary: 53000, paymentStatus: 'Paid', paymentDate: new Date(2024,5,28).toISOString() },
  { id: 'SR2', teacherId: 'T2002', teacherName: 'Mr. Samuel Green', month: 6, year: 2024, basicSalary: 55000, totalAllowances: 6000, totalDeductions: 2500, netSalary: 58500, paymentStatus: 'Pending' },
  { id: 'SR3', teacherId: 'T2001', teacherName: 'Dr. Eleanor Vance', month: 5, year: 2024, basicSalary: 50000, totalAllowances: 5000, totalDeductions: 2000, netSalary: 53000, paymentStatus: 'Paid', paymentDate: new Date(2024,4,30).toISOString() },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function SalaryManagementPage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(initialSalaryRecords);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<SalaryRecord | null>(null);

  const form = useForm<SalaryRecordFormValues>({
    resolver: zodResolver(salaryRecordFormSchema),
    defaultValues: {
      teacherId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      paymentStatus: 'Pending',
    },
  });

  const watchedBasicSalary = useWatch({ control: form.control, name: 'basicSalary' });
  const watchedAllowances = useWatch({ control: form.control, name: 'totalAllowances' });
  const watchedDeductions = useWatch({ control: form.control, name: 'totalDeductions' });

  const calculatedNetSalary = useMemo(() => {
    const basic = Number(watchedBasicSalary) || 0;
    const allowances = Number(watchedAllowances) || 0;
    const deductions = Number(watchedDeductions) || 0;
    return basic + allowances - deductions;
  }, [watchedBasicSalary, watchedAllowances, watchedDeductions]);

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        teacherId: editingRecord.teacherId,
        month: editingRecord.month,
        year: editingRecord.year,
        basicSalary: editingRecord.basicSalary,
        totalAllowances: editingRecord.totalAllowances,
        totalDeductions: editingRecord.totalDeductions,
        paymentStatus: editingRecord.paymentStatus,
      });
    } else {
      form.reset({
        teacherId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        paymentStatus: 'Pending',
      });
    }
  }, [editingRecord, form, showSalaryModal]);

  const handleFormSubmit = (values: SalaryRecordFormValues) => {
    const teacher = sampleTeachersForSalary.find(t => t.id === values.teacherId);
    if (!teacher) {
        toast({ title: "Error", description: "Selected teacher not found.", variant: "destructive" });
        return;
    }

    const netSalary = values.basicSalary + values.totalAllowances - values.totalDeductions;

    if (editingRecord) {
      setSalaryRecords(prevRecords =>
        prevRecords.map(r =>
          r.id === editingRecord.id ? { 
            ...r, 
            ...values, 
            teacherName: teacher.name, 
            netSalary,
            paymentDate: values.paymentStatus === 'Paid' ? (r.paymentDate || new Date().toISOString()) : undefined,
           } : r
        )
      );
      toast({
        title: 'Salary Record Updated',
        description: `Salary for ${teacher.name} (${MONTH_NAMES[values.month-1]} ${values.year}) updated.`,
      });
    } else {
      const newRecord: SalaryRecord = {
        id: `SR${Date.now().toString().slice(-4)}`,
        ...values,
        teacherName: teacher.name,
        netSalary,
        paymentDate: values.paymentStatus === 'Paid' ? new Date().toISOString() : undefined,
      };
      setSalaryRecords(prevRecords => [...prevRecords, newRecord]);
      toast({
        title: 'Salary Record Added',
        description: `Salary for ${teacher.name} (${MONTH_NAMES[values.month-1]} ${values.year}) added.`,
      });
    }
    setShowSalaryModal(false);
    setEditingRecord(null);
  };

  const openAddModal = () => {
    setEditingRecord(null);
    form.reset({ 
        teacherId: '', 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(),
        basicSalary: 0, 
        totalAllowances: 0, 
        totalDeductions: 0, 
        paymentStatus: 'Pending' 
    });
    setShowSalaryModal(true);
  };

  const openEditModal = (record: SalaryRecord) => {
    setEditingRecord(record);
    setShowSalaryModal(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      setSalaryRecords(prevRecords => prevRecords.filter(r => r.id !== recordToDelete.id));
      toast({
        title: 'Salary Record Deleted',
        description: `Salary record for ${recordToDelete.teacherName} has been removed.`,
        variant: 'destructive'
      });
      setRecordToDelete(null);
    }
  };
  
  const sortedSalaryRecords = useMemo(() => {
    return [...salaryRecords].sort((a,b) => b.year - a.year || b.month - a.month || a.teacherName.localeCompare(b.teacherName));
  }, [salaryRecords]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <Banknote className="mr-3 h-8 w-8" /> Teacher Salary Management
          </h1>
          <p className="text-muted-foreground">
            Manage monthly salary records for teachers.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Salary Record
          </Button>
        )}
      </div>
      
      <Dialog open={showSalaryModal} onOpenChange={(isOpen) => {
        setShowSalaryModal(isOpen);
        if (!isOpen) setEditingRecord(null);
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingRecord ? 'Edit Salary Record' : 'Add New Salary Record'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRecord}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {sampleTeachersForSalary.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)} disabled={!!editingRecord}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {MONTH_NAMES.map((name, index) => <SelectItem key={index+1} value={String(index+1)}>{name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl><Input type="number" placeholder="Enter year" {...field} disabled={!!editingRecord} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="basicSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basic Salary</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="totalAllowances"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowances</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="totalDeductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductions</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormItem>
                <FormLabel>Net Salary (Auto-calculated)</FormLabel>
                <div className="flex items-center p-3 rounded-md bg-muted min-h-[40px]">
                    <Calculator className="mr-2 h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold text-primary">
                        ${calculatedNetSalary.toFixed(2)}
                    </span>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2 sticky bottom-0 bg-background py-4 border-t -mx-2 px-2 -mb-4 pb-4">
                <Button type="button" variant="outline" onClick={() => { setShowSalaryModal(false); setEditingRecord(null);}} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingRecord ? 'Save Changes' : 'Add Record'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!recordToDelete} onOpenChange={(isOpen) => { if (!isOpen) setRecordToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the salary record for {recordToDelete?.teacherName} ({recordToDelete ? MONTH_NAMES[recordToDelete.month-1] : ''} {recordToDelete?.year}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Salary Records</CardTitle>
          <CardDescription>Overview of teacher salary payments.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSalaryRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Salary Records Found</p>
              <p>{user?.role === 'admin' ? "Start by adding salary records." : "No salary records are currently available."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead className="text-right">Basic Salary</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSalaryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.teacherName}</TableCell>
                      <TableCell>{MONTH_NAMES[record.month-1]} {record.year}</TableCell>
                      <TableCell className="text-right">${record.basicSalary.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${record.totalAllowances.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${record.totalDeductions.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">${record.netSalary.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${record.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'}`}>
                            {record.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>{record.paymentDate ? format(new Date(record.paymentDate), 'PP') : '-'}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(record)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setRecordToDelete(record)} className="w-full sm:w-auto">
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

