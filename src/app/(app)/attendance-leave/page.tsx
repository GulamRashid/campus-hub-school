
'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { UserCheck, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string; // Could be used for more detailed employee linking later
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  reason: string;
  status: LeaveRequestStatus;
  appliedDate: string; // ISO Date string
}

const initialLeaveRequests: LeaveRequest[] = [
  { id: 'LR001', employeeName: 'Mr. Samuel Green', employeeId: 'T2002', leaveType: 'Annual', startDate: '2024-08-05', endDate: '2024-08-07', reason: 'Family vacation', status: 'Pending', appliedDate: '2024-07-20' },
  { id: 'LR002', employeeName: 'Ms. Olivia Chen', employeeId: 'T2003', leaveType: 'Sick', startDate: '2024-07-22', endDate: '2024-07-23', reason: 'Flu symptoms', status: 'Approved', appliedDate: '2024-07-21' },
  { id: 'LR003', employeeName: 'Dr. Eleanor Vance', employeeId: 'T2001', leaveType: 'Casual', startDate: '2024-08-10', endDate: '2024-08-10', reason: 'Personal appointment', status: 'Pending', appliedDate: '2024-07-25' },
  { id: 'LR004', employeeName: 'Mr. David Lee', employeeId: 'T2004', leaveType: 'Unpaid', startDate: '2024-07-28', endDate: '2024-07-29', reason: 'Urgent travel', status: 'Rejected', appliedDate: '2024-07-26' },
];

export default function AttendanceLeavePage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [requestToProcess, setRequestToProcess] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);

  const handleProcessRequest = () => {
    if (!requestToProcess) return;

    const { id, action } = requestToProcess;
    setLeaveRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, status: action === 'approve' ? 'Approved' : 'Rejected' } : req
      )
    );
    toast({
      title: `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `The leave request for ${leaveRequests.find(r=>r.id === id)?.employeeName} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
    setRequestToProcess(null);
  };

  const getStatusBadgeVariant = (status: LeaveRequestStatus) => {
    switch (status) {
      case 'Approved': return 'default'; // default is primary color based, often green-ish
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <UserCheck className="mr-3 h-8 w-8" /> Attendance & Leave Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage employee leave requests.
          </p>
        </div>
        {/* Placeholder for Add Attendance/Leave buttons for Admin */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Leave Requests</CardTitle>
          <CardDescription>Current leave applications from employees.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarClock className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Leave Requests Found</p>
              <p>There are currently no pending or processed leave requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.employeeName}</TableCell>
                      <TableCell>{request.leaveType}</TableCell>
                      <TableCell>{format(new Date(request.startDate), 'PP')}</TableCell>
                      <TableCell>{format(new Date(request.endDate), 'PP')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(request.appliedDate), 'PP')}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right">
                          {request.status === 'Pending' ? (
                            <div className="space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestToProcess({ id: request.id, action: 'approve' })}
                                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestToProcess({ id: request.id, action: 'reject' })}
                                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Processed</span>
                          )}
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

      <AlertDialog open={!!requestToProcess} onOpenChange={(isOpen) => { if (!isOpen) setRequestToProcess(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {requestToProcess?.action} this leave request for {leaveRequests.find(r=>r.id === requestToProcess?.id)?.employeeName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequestToProcess(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessRequest}
              className={buttonVariants({ variant: requestToProcess?.action === 'reject' ? "destructive" : "default" })}
            >
              {requestToProcess?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Placeholder for Daily Attendance Section - Admin View */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Daily Attendance (Placeholder)</CardTitle>
          <CardDescription>Mark and view daily attendance for staff. (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">Functionality for marking daily in/out times and viewing attendance logs will be available here.</p>
        </CardContent>
      </Card>

    </div>
  );
}
