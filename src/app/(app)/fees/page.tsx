
'use client';

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
import { PlusCircle, Edit, Trash2, DollarSign, Landmark, Users, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isPast } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface FeeStructure {
  id: string;
  className: string;
  feeType: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annually' | 'One-time';
}

type StudentFeeStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';

interface StudentFeeRecord {
  id: string;
  studentName: string;
  className: string;
  feeTypeDescription: string; // e.g., "Annual Fee - Class 5"
  amountDue: number;
  amountPaid: number;
  dueDate: string; // ISO Date string
  status: StudentFeeStatus;
  lastPaymentDate?: string; // ISO Date string
  notes?: string;
}

const feeStructureFormSchema = z.object({
  className: z.string().min(1, { message: 'Class is required.' }),
  feeType: z.string().min(3, { message: 'Fee type must be at least 3 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  frequency: z.enum(['Monthly', 'Quarterly', 'Annually', 'One-time']),
});

type FeeStructureFormValues = z.infer<typeof feeStructureFormSchema>;

const paymentFormSchema = z.object({
  paymentAmount: z.coerce.number().positive({ message: 'Payment amount must be positive.' }),
  paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid payment date.' }),
  notes: z.string().optional(),
});
type PaymentFormValues = z.infer<typeof paymentFormSchema>;


const initialFeeStructures: FeeStructure[] = [
  { id: 'FS1', className: '10', feeType: 'Tuition Fee', amount: 15000, frequency: 'Quarterly' },
  { id: 'FS2', className: '5', feeType: 'Activity Fee', amount: 2000, frequency: 'Annually' },
  { id: 'FS3', className: 'NC', feeType: 'Admission Fee', amount: 5000, frequency: 'One-time' },
  { id: 'FS4', className: '12', feeType: 'Lab Fee', amount: 3000, frequency: 'Annually' },
];

const initialStudentFeeRecords: StudentFeeRecord[] = [
  { id: 'SFR001', studentName: 'Alice Johnson', className: '10', feeTypeDescription: 'Tuition Fee - Q1', amountDue: 15000, amountPaid: 15000, dueDate: '2024-04-15', status: 'Paid', lastPaymentDate: '2024-04-10', notes: 'Full payment received.' },
  { id: 'SFR002', studentName: 'Bob Williams', className: '9', feeTypeDescription: 'Activity Fee', amountDue: 1800, amountPaid: 0, dueDate: '2024-05-01', status: 'Pending', notes: '' },
  { id: 'SFR003', studentName: 'Charlie Brown', className: '11', feeTypeDescription: 'Transport Fee - Term 1', amountDue: 7500, amountPaid: 3000, dueDate: '2024-04-20', status: 'Partially Paid', lastPaymentDate: '2024-04-18', notes: 'First installment paid.'},
  { id: 'SFR004', studentName: 'Diana Miller', className: 'NC', feeTypeDescription: 'Admission Fee', amountDue: 5000, amountPaid: 0, dueDate: '2024-03-01', status: 'Overdue' },
  { id: 'SFR005', studentName: 'Edward Davis', className: '12', feeTypeDescription: 'Lab Fee', amountDue: 3000, amountPaid: 3000, dueDate: '2024-06-10', status: 'Paid', lastPaymentDate: '2024-06-08'},
];


const CLASS_OPTIONS = ["NC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const FREQUENCY_OPTIONS: FeeStructure['frequency'][] = ['Monthly', 'Quarterly', 'Annually', 'One-time'];

export default function FeesManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(initialFeeStructures);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureToDelete, setStructureToDelete] = useState<FeeStructure | null>(null);

  const [studentFeeRecords, setStudentFeeRecords] = useState<StudentFeeRecord[]>(initialStudentFeeRecords);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingFeeRecord, setProcessingFeeRecord] = useState<StudentFeeRecord | null>(null);

  const structureForm = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: { className: '', feeType: '', amount: 0, frequency: 'Monthly' },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { paymentAmount: 0, paymentDate: new Date().toISOString().split('T')[0], notes: '' },
  });

  useEffect(() => {
    if (editingStructure) {
      structureForm.reset(editingStructure);
    } else {
      structureForm.reset({ className: '', feeType: '', amount: 0, frequency: 'Monthly' });
    }
  }, [editingStructure, structureForm, showStructureModal]);

  useEffect(() => {
    if (processingFeeRecord) {
      paymentForm.reset({
        paymentAmount: processingFeeRecord.amountDue - processingFeeRecord.amountPaid > 0 ? processingFeeRecord.amountDue - processingFeeRecord.amountPaid : 0,
        paymentDate: new Date().toISOString().split('T')[0],
        notes: processingFeeRecord.notes || '',
      });
    }
  }, [processingFeeRecord, paymentForm]);

  const handleStructureFormSubmit = (values: FeeStructureFormValues) => {
    if (editingStructure) {
      setFeeStructures(prev =>
        prev.map(s => (s.id === editingStructure.id ? { ...s, ...values } : s))
      );
      toast({
        title: 'Fee Structure Updated',
        description: `Fee structure for Class ${values.className} (${values.feeType}) updated.`,
      });
    } else {
      const newStructure: FeeStructure = {
        id: `FS${Date.now().toString().slice(-4)}`,
        ...values,
      };
      setFeeStructures(prev => [...prev, newStructure]);
      toast({
        title: 'Fee Structure Added',
        description: `New fee structure for Class ${values.className} (${values.feeType}) added.`,
      });
    }
    setShowStructureModal(false);
    setEditingStructure(null);
  };

  const openAddStructureModal = () => {
    setEditingStructure(null);
    structureForm.reset({ className: '', feeType: '', amount: 0, frequency: 'Monthly' });
    setShowStructureModal(true);
  };

  const openEditStructureModal = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setShowStructureModal(true);
  };

  const handleDeleteStructureConfirm = () => {
    if (structureToDelete) {
      setFeeStructures(prev => prev.filter(s => s.id !== structureToDelete.id));
      toast({
        title: 'Fee Structure Deleted',
        description: `Fee structure (${structureToDelete.feeType} for Class ${structureToDelete.className}) has been removed.`,
        variant: 'destructive',
      });
      setStructureToDelete(null);
    }
  };

  const openPaymentModal = (record: StudentFeeRecord) => {
    setProcessingFeeRecord(record);
    setShowPaymentModal(true);
  };

  const handlePaymentFormSubmit = (values: PaymentFormValues) => {
    if (!processingFeeRecord) return;

    const newAmountPaid = processingFeeRecord.amountPaid + values.paymentAmount;
    let newStatus: StudentFeeStatus = 'Pending';

    if (newAmountPaid >= processingFeeRecord.amountDue) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'Partially Paid';
    } else { // newAmountPaid is 0 or less
      newStatus = isPast(parseISO(processingFeeRecord.dueDate)) ? 'Overdue' : 'Pending';
    }
    
    setStudentFeeRecords(prevRecords =>
      prevRecords.map(r =>
        r.id === processingFeeRecord.id
          ? {
              ...r,
              amountPaid: newAmountPaid,
              lastPaymentDate: values.paymentDate,
              notes: values.notes,
              status: newStatus,
            }
          : r
      )
    );

    toast({
      title: 'Payment Recorded',
      description: `Payment of $${values.paymentAmount.toFixed(2)} for ${processingFeeRecord.studentName} recorded.`,
    });
    setShowPaymentModal(false);
    setProcessingFeeRecord(null);
  };

  const getStatusBadgeVariant = (status: StudentFeeStatus) => {
    switch (status) {
      case 'Paid': return 'default'; // Often green-ish
      case 'Partially Paid': return 'secondary'; // Muted
      case 'Pending': return 'outline'; 
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <DollarSign className="mr-3 h-8 w-8" /> Fees Management
          </h1>
          <p className="text-muted-foreground">
            Define fee structures and track student payments. Online payment integration is conceptual.
          </p>
        </div>
      </div>

      {/* Fee Structures Management */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <CardTitle className="font-headline text-xl">Fee Structures List</CardTitle>
                <CardDescription>Define fee structures for various classes.</CardDescription>
            </div>
            {user?.role === 'admin' && (
            <Button onClick={openAddStructureModal} className="w-full mt-2 sm:mt-0 sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Fee Structure
            </Button>
            )}
        </CardHeader>
        <CardContent>
          {feeStructures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Landmark className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Fee Structures Defined</p>
              <p>{user?.role === 'admin' ? "Start by adding fee structures." : "No fee structures are currently defined."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Frequency</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>{structure.className}</TableCell>
                      <TableCell>{structure.feeType}</TableCell>
                      <TableCell className="text-right">${structure.amount.toFixed(2)}</TableCell>
                      <TableCell>{structure.frequency}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditStructureModal(structure)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setStructureToDelete(structure)} className="w-full sm:w-auto">
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

      {/* Dialog for Add/Edit Fee Structure */}
      <Dialog open={showStructureModal} onOpenChange={(isOpen) => {
        setShowStructureModal(isOpen);
        if (!isOpen) setEditingStructure(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingStructure ? 'Edit Fee Structure' : 'Add New Fee Structure'}
            </DialogTitle>
          </DialogHeader>
          <Form {...structureForm}>
            <form onSubmit={structureForm.handleSubmit(handleStructureFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={structureForm.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                      <SelectContent>{CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={structureForm.control}
                name="feeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Type</FormLabel>
                    <FormControl><Input placeholder="e.g., Tuition Fee, Annual Fee" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={structureForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl><Input type="number" placeholder="Enter amount" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={structureForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                      <SelectContent>{FREQUENCY_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowStructureModal(false); setEditingStructure(null); }} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingStructure ? 'Save Changes' : 'Add Structure'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog for Delete Fee Structure Confirmation */}
      <AlertDialog open={!!structureToDelete} onOpenChange={(isOpen) => { if (!isOpen) setStructureToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fee structure: {structureToDelete?.feeType} for Class {structureToDelete?.className}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStructureToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStructureConfirm} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Student Fee Records Section */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Users className="mr-3 h-6 w-6" /> Student Fee Records
          </CardTitle>
          <CardDescription>Manage and track individual student fee payments. (Client-side mock data)</CardDescription>
        </CardHeader>
        <CardContent>
          {studentFeeRecords.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                <Receipt className="mx-auto h-16 w-16 opacity-50" />
                <p className="mt-4 text-lg font-semibold">No Student Fee Records Found</p>
                <p>Student-specific fee payment records will appear here once added or generated.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Description</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFeeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{record.className}</TableCell>
                      <TableCell>{record.feeTypeDescription}</TableCell>
                      <TableCell className="text-right">${record.amountDue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${record.amountPaid.toFixed(2)}</TableCell>
                      <TableCell>{format(parseISO(record.dueDate), 'PP')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openPaymentModal(record)}
                            disabled={record.status === 'Paid'}
                          >
                            {record.status === 'Paid' ? 'Paid' : 'Manage Payment'}
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

      {/* Dialog for Manage Student Payment */}
      <Dialog open={showPaymentModal} onOpenChange={(isOpen) => {
        setShowPaymentModal(isOpen);
        if (!isOpen) setProcessingFeeRecord(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Manage Payment</DialogTitle>
            {processingFeeRecord && (
              <DialogDescription>
                Recording payment for {processingFeeRecord.studentName} (Class {processingFeeRecord.className}) - {processingFeeRecord.feeTypeDescription}.
                <br />
                Amount Due: ${processingFeeRecord.amountDue.toFixed(2)} | Already Paid: ${processingFeeRecord.amountPaid.toFixed(2)} | Remaining: ${(processingFeeRecord.amountDue - processingFeeRecord.amountPaid).toFixed(2)}
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handlePaymentFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={paymentForm.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount to Pay Now</FormLabel>
                    <FormControl><Input type="number" placeholder="Enter amount being paid" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Paid via UPI ref #123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowPaymentModal(false); setProcessingFeeRecord(null); }} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">Record Payment</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
