
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
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Edit, Trash2, ClipboardList, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ExamSchedule {
  id: string;
  examName: string;
  applicableClasses: string[]; // e.g., ["10", "11", "12"]
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Results Declared';
}

const CLASS_OPTIONS = ["NC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const STATUS_OPTIONS: ExamSchedule['status'][] = ['Upcoming', 'Ongoing', 'Completed', 'Results Declared'];

const examScheduleFormSchema = z.object({
  examName: z.string().min(3, { message: "Exam name must be at least 3 characters." }),
  applicableClasses: z.array(z.string()).min(1, { message: "At least one class must be selected." }),
  startDate: z.string().refine((date) => isValid(parseISO(date)), { message: "Invalid start date."}),
  endDate: z.string().refine((date) => isValid(parseISO(date)), { message: "Invalid end date."}),
  status: z.enum(STATUS_OPTIONS),
}).refine(data => parseISO(data.endDate) >= parseISO(data.startDate), {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type ExamScheduleFormValues = z.infer<typeof examScheduleFormSchema>;

const initialExamSchedules: ExamSchedule[] = [
  { id: 'EXM001', examName: 'Mid-Term Exams 2024', applicableClasses: ['10', '11', '12'], startDate: '2024-09-15', endDate: '2024-09-30', status: 'Upcoming' },
  { id: 'EXM002', examName: 'Annual Exams 2024 - Junior Wing', applicableClasses: ['NC', '1', '2', '3', '4', '5'], startDate: '2024-03-01', endDate: '2024-03-15', status: 'Completed' },
  { id: 'EXM003', examName: 'Unit Test 1 - Seniors', applicableClasses: ['9', '10'], startDate: '2024-07-20', endDate: '2024-07-25', status: 'Ongoing' },
];

export default function ExamManagementPage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(initialExamSchedules);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<ExamSchedule | null>(null);

  const form = useForm<ExamScheduleFormValues>({
    resolver: zodResolver(examScheduleFormSchema),
    defaultValues: {
      examName: '',
      applicableClasses: [],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Upcoming',
    },
  });

  useEffect(() => {
    if (editingSchedule) {
      form.reset({
        ...editingSchedule,
        startDate: format(parseISO(editingSchedule.startDate), 'yyyy-MM-dd'),
        endDate: format(parseISO(editingSchedule.endDate), 'yyyy-MM-dd'),
      });
    } else {
      form.reset({
        examName: '',
        applicableClasses: [],
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'Upcoming',
      });
    }
  }, [editingSchedule, form, showModal]);

  const handleFormSubmit = (values: ExamScheduleFormValues) => {
    if (editingSchedule) {
      setExamSchedules(prevSchedules =>
        prevSchedules.map(s => (s.id === editingSchedule.id ? { ...s, ...values } : s))
      );
      toast({
        title: 'Exam Schedule Updated',
        description: `Schedule "${values.examName}" updated successfully.`,
      });
    } else {
      const newSchedule: ExamSchedule = {
        id: `EXM${Date.now().toString().slice(-4)}`,
        ...values,
      };
      setExamSchedules(prevSchedules => [...prevSchedules, newSchedule]);
      toast({
        title: 'Exam Schedule Added',
        description: `New schedule "${values.examName}" added successfully.`,
      });
    }
    setShowModal(false);
    setEditingSchedule(null);
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    form.reset({
      examName: '',
      applicableClasses: [],
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Upcoming',
    });
    setShowModal(true);
  };

  const openEditModal = (schedule: ExamSchedule) => {
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleDeleteConfirm = () => {
    if (scheduleToDelete) {
      setExamSchedules(prevSchedules => prevSchedules.filter(s => s.id !== scheduleToDelete.id));
      toast({
        title: 'Exam Schedule Deleted',
        description: `Schedule "${scheduleToDelete.examName}" has been removed.`,
        variant: 'destructive',
      });
      setScheduleToDelete(null);
    }
  };
  
  const sortedSchedules = useMemo(() => {
    return [...examSchedules].sort((a,b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());
  }, [examSchedules]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <ClipboardList className="mr-3 h-8 w-8" /> Exam Schedule Management
          </h1>
          <p className="text-muted-foreground">
            Define and manage exam schedules for various classes.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Exam Schedule
          </Button>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(isOpen) => { setShowModal(isOpen); if (!isOpen) setEditingSchedule(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingSchedule ? 'Edit Exam Schedule' : 'Add New Exam Schedule'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Mid-Term Exams 2024" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="applicableClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicable Classes</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 p-2 border rounded-md">
                      {CLASS_OPTIONS.map((classOpt) => (
                        <FormItem key={classOpt} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(classOpt)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), classOpt])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== classOpt
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            Class {classOpt}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingSchedule(null); }} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingSchedule ? 'Save Changes' : 'Add Schedule'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!scheduleToDelete} onOpenChange={(isOpen) => { if (!isOpen) setScheduleToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam schedule: "{scheduleToDelete?.examName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScheduleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Exam Schedules List</CardTitle>
          <CardDescription>Overview of all planned examinations.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSchedules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Exam Schedules Found</p>
              <p>{user?.role === 'admin' ? "Start by adding new exam schedules." : "No exam schedules are currently defined."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Applicable Classes</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.examName}</TableCell>
                      <TableCell>{schedule.applicableClasses.join(', ')}</TableCell>
                      <TableCell>{format(parseISO(schedule.startDate), 'PPP')}</TableCell>
                      <TableCell>{format(parseISO(schedule.endDate), 'PPP')}</TableCell>
                      <TableCell>
                        <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            schedule.status === 'Upcoming' && 'bg-blue-100 text-blue-700',
                            schedule.status === 'Ongoing' && 'bg-yellow-100 text-yellow-700',
                            schedule.status === 'Completed' && 'bg-green-100 text-green-700',
                            schedule.status === 'Results Declared' && 'bg-purple-100 text-purple-700'
                        )}>
                            {schedule.status}
                        </span>
                      </TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(schedule)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setScheduleToDelete(schedule)} className="w-full sm:w-auto">
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
