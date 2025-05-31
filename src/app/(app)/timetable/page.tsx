
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BookOpen, Clock, MapPin, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetableEntry {
  id: string;
  classId: string; 
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  time: string; 
  subject: string;
  teacher: string;
  room: string;
}

const timetableEntrySchema = z.object({
  classId: z.string().min(1, "Class & Section is required"),
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
  time: z.string().min(1, "Period / Time Slot is required"),
  subject: z.string().min(1, "Subject is required"),
  teacher: z.string().min(1, "Teacher is required"),
  room: z.string().min(1, "Room is required"),
});

type TimetableEntryFormValues = z.infer<typeof timetableEntrySchema>;

// Mock data - in a real app, these would be fetched from a database and managed by an admin
const timeSlots = [
  '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', 
  '13:00 - 14:00', '14:00 - 15:00',
];
const daysOfWeek: TimetableEntry['day'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
// Mock data - Classes, Subjects, Teachers, Rooms would be managed by an Admin in a full system.
const sampleClasses = ["NC-A", "1A", "5B", "10C", "12A"]; // Represents Class & Section
const sampleSubjects = ["Mathematics", "Physics", "Chemistry", "English", "History", "Art", "Music", "Physical Education", "Extra Curricular"];
const sampleTeachers = ["Ms. Smith", "Mr. Jones", "Mr. Brown", "Ms. White", "Ms. Davis", "Mr. Wilson", "Mr. Green", "Ms. Taylor", "Mr. Harris", "Ms. Lee", "Mr. Clark"];
const sampleRooms = ["Room 101", "Lab A", "Room 102", "Lab B", "Studio 1", "Hall A", "Gym", "CS Lab"];

const initialTimetableData: TimetableEntry[] = [
  { id: 'tt1', classId: '10C', day: 'monday', time: '09:00 - 10:00', subject: 'Mathematics', room: 'Room 101', teacher: 'Ms. Smith' },
  { id: 'tt2', classId: '10C', day: 'monday', time: '10:00 - 11:00', subject: 'History', room: 'Room 102', teacher: 'Mr. Brown' },
  { id: 'tt3', classId: '10C', day: 'tuesday', time: '09:00 - 10:00', subject: 'Physics', room: 'Lab A', teacher: 'Mr. Jones' },
  { id: 'tt4', classId: '5B', day: 'wednesday', time: '11:00 - 12:00', subject: 'Art', room: 'Studio 1', teacher: 'Mr. Green' },
  { id: 'tt5', classId: '10C', day: 'saturday', time: '10:00 - 11:00', subject: 'Extra Curricular', room: 'Hall A', teacher: 'Ms. Taylor' },
];


export default function TimetablePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>(initialTimetableData);
  const [selectedClass, setSelectedClass] = useState<string>(sampleClasses[2]); 
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);

  const form = useForm<TimetableEntryFormValues>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      classId: selectedClass,
      day: 'monday',
      time: timeSlots[0],
      subject: '',
      teacher: '',
      room: '',
    },
  });

 useEffect(() => {
    if (editingEntry) {
      form.reset(editingEntry);
    } else {
      form.reset({
        classId: selectedClass, 
        day: 'monday',
        time: timeSlots[0],
        subject: '',
        teacher: '',
        room: '',
      });
    }
  }, [editingEntry, selectedClass, form, showEntryModal]);


  const handleFormSubmit = (values: TimetableEntryFormValues) => {
    if (editingEntry) {
      setTimetableData(prev =>
        prev.map(entry => (entry.id === editingEntry.id ? { ...entry, ...values } : entry))
      );
      toast({
        title: "Timetable Entry Updated",
        description: `Schedule for ${values.classId} on ${values.day} at ${values.time} updated.`,
      });
    } else {
      const newEntry: TimetableEntry = {
        id: `tt${Date.now()}`,
        ...values,
      };
      setTimetableData(prev => [...prev, newEntry]);
      toast({
        title: "Timetable Entry Added",
        description: `${values.subject} for ${values.classId} on ${values.day} at ${values.time} has been scheduled.`,
      });
    }
    setShowEntryModal(false);
    setEditingEntry(null);
  };
  
  const openAddModal = () => {
    setEditingEntry(null);
    form.reset({ classId: selectedClass, day: 'monday', time: timeSlots[0], subject: '', teacher: '', room: '' });
    setShowEntryModal(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      setTimetableData(prev => prev.filter(entry => entry.id !== entryToDelete.id));
      toast({
        title: 'Timetable Entry Deleted',
        description: `The entry for ${entryToDelete.subject} on ${entryToDelete.day} at ${entryToDelete.time} has been removed.`,
        variant: 'destructive',
      });
      setEntryToDelete(null);
    }
  };

  const getCellData = (time: string, day: TimetableEntry['day']): TimetableEntry | undefined => {
    return timetableData.find(entry => entry.classId === selectedClass && entry.time === time && entry.day === day);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Class Timetable Management</h1>
          <p className="text-muted-foreground">
            View and manage weekly class schedules. Lists for classes, subjects, teachers, and rooms are predefined for demonstration.
          </p>
        </div>
         <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[220px]"> {/* Adjusted width slightly */}
                    <SelectValue placeholder="Filter by Class & Section" />
                </SelectTrigger>
                <SelectContent>
                    {sampleClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
            {user?.role === 'admin' && (
              <Button onClick={openAddModal} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Timetable Entry
              </Button>
            )}
        </div>
      </div>

      <Dialog open={showEntryModal} onOpenChange={(isOpen) => {
        setShowEntryModal(isOpen);
        if (!isOpen) setEditingEntry(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingEntry ? 'Update the details for this schedule.' : 'Fill in the details for the new class schedule.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="classId"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Class & Section</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select class & section" /></SelectTrigger></FormControl>
                      <SelectContent>{sampleClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="day"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                          <SelectContent>{daysOfWeek.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField control={form.control} name="time"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Period / Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger></FormControl>
                          <SelectContent>{timeSlots.map(ts => <SelectItem key={ts} value={ts}>{ts}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              <FormField control={form.control} name="subject"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger></FormControl>
                          <SelectContent>{sampleSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField control={form.control} name="teacher"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Teacher</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger></FormControl>
                          <SelectContent>{sampleTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField control={form.control} name="room"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Room/Lab</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger></FormControl>
                          <SelectContent>{sampleRooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => {setShowEntryModal(false); setEditingEntry(null);}} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" className="w-full sm:w-auto">{editingEntry ? 'Save Changes' : 'Add Entry'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!entryToDelete} onOpenChange={(isOpen) => { if(!isOpen) setEntryToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the timetable entry: 
              {entryToDelete?.subject} for Class {entryToDelete?.classId} on {entryToDelete?.day} at {entryToDelete?.time}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Weekly Schedule for {selectedClass}</CardTitle>
          <CardDescription>
            {user?.role === 'admin' ? "Click on an entry's actions to edit or delete, or add a new entry using the button above." : "Current timetable for the selected class."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px] sm:min-w-[120px] font-semibold"><Clock className="inline-block mr-1 h-4 w-4" />Time</TableHead>
                  {daysOfWeek.map(day => (
                    <TableHead key={day} className="min-w-[150px] sm:min-w-[200px] capitalize font-semibold">{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((time, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-medium whitespace-nowrap">{time}</TableCell>
                    {daysOfWeek.map(day => {
                      const entry = getCellData(time, day);
                      const isLunch = time === '12:00 - 13:00';
                      return (
                        <TableCell key={day} className="p-1 align-top min-h-[100px]">
                          {isLunch ? (
                            <Card className="h-full bg-secondary/50 min-h-[90px]">
                                <CardContent className="p-3 flex items-center justify-center h-full">
                                    <h3 className="font-semibold text-xs sm:text-sm text-primary">LUNCH BREAK</h3>
                                </CardContent>
                            </Card>
                          ) : entry ? (
                            <Card className={'h-full bg-card hover:bg-secondary/30 transition-colors min-h-[90px]'}>
                              <CardContent className="p-2 space-y-1 relative">
                                <h3 className="font-semibold text-xs sm:text-sm text-primary flex items-center">
                                  <BookOpen className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> 
                                  {entry.subject}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {entry.teacher}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="inline-block mr-1 h-3 w-3 flex-shrink-0" />
                                  {entry.room}
                                </p>
                                {user?.role === 'admin' && (
                                  <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModal(entry)} title="Edit Entry">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setEntryToDelete(entry)} title="Delete Entry">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="h-full p-3 text-center text-muted-foreground/50 min-h-[90px] flex items-center justify-center border rounded-md border-dashed">
                              -
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

