
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Megaphone, CalendarClock, Info, Edit, Trash2, Users, Tag } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const NOTICE_TYPES = ['General', 'Academic', 'Event', 'Urgent', 'Administrative', 'Holiday'] as const;
const TARGET_AUDIENCES = ['All', 'Teachers', 'Students', 'Parents'] as const;

interface Notice {
  id: string;
  title: string;
  content: string;
  issuedDate: Date;
  expiryDate?: Date;
  author: string;
  noticeType?: typeof NOTICE_TYPES[number];
  targetAudience?: Array<typeof TARGET_AUDIENCES[number]>;
}

const noticeFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  author: z.string().min(2, { message: "Author name must be at least 2 characters." }),
  expiryDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format for expiry date.",
  }),
  noticeType: z.enum(NOTICE_TYPES).optional(),
  targetAudience: z.array(z.enum(TARGET_AUDIENCES)).optional().default(['All']),
});

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

const initialNotices: Notice[] = [
  { id: '1', title: 'Upcoming Parent-Teacher Meeting', content: 'A parent-teacher meeting is scheduled for next Saturday, 10:00 AM - 01:00 PM. Please register your preferred time slot.', issuedDate: new Date('2024-07-15'), expiryDate: new Date('2024-07-25'), author: 'Admin Office', noticeType: 'Event', targetAudience: ['Parents', 'Teachers'] },
  { id: '2', title: 'Holiday Announcement: Summer Break', content: 'The school will be closed for summer break from July 28th to August 15th. Enjoy your holidays!', issuedDate: new Date('2024-07-10'), author: 'Admin Office', noticeType: 'Holiday', targetAudience: ['All'] },
  { id: '3', title: 'Library Books Due', content: 'All library books issued before June 1st must be returned by July 20th to avoid fines.', issuedDate: new Date('2024-07-05'), expiryDate: new Date('2024-07-20'), author: 'Librarian', noticeType: 'Administrative', targetAudience: ['Students']},
  { id: '4', title: 'Annual Science Fair Registration', content: 'Registrations for the Annual Science Fair are now open. Last date to submit projects is August 5th.', issuedDate: new Date('2024-06-20'), expiryDate: new Date('2024-08-05'), author: 'Science Club', noticeType: 'Event', targetAudience: ['Students', 'Teachers'] },
  { id: '5', title: 'PTA Meeting (Expired)', content: 'PTA meeting was held last month.', issuedDate: new Date('2024-05-01'), expiryDate: new Date('2024-05-15'), author: 'PTA Committee', noticeType: 'Event', targetAudience: ['Parents'] },
  { id: '6', title: 'Urgent: Water Supply Disruption Tomorrow', content: 'Due to maintanence work, water supply will be disrupted tomorrow from 10 AM to 2 PM.', issuedDate: new Date(), author: 'Admin Office', noticeType: 'Urgent', targetAudience: ['All']},
];

export default function NoticesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: "",
      content: "",
      author: user?.name || "Admin Office",
      expiryDate: "",
      noticeType: 'General',
      targetAudience: ['All'],
    },
  });

  useEffect(() => {
    if (editingNotice) {
      form.reset({
        title: editingNotice.title,
        content: editingNotice.content,
        author: editingNotice.author,
        expiryDate: editingNotice.expiryDate ? format(editingNotice.expiryDate, 'yyyy-MM-dd') : "",
        noticeType: editingNotice.noticeType || 'General',
        targetAudience: editingNotice.targetAudience || ['All'],
      });
    } else {
      form.reset({ author: user?.name || "Admin Office", title: "", content: "", expiryDate: "", noticeType: 'General', targetAudience: ['All'] });
    }
  }, [editingNotice, form, showModal, user]);

  const handleFormSubmit = (values: NoticeFormValues) => {
    if (editingNotice) {
      setNotices(prevNotices =>
        prevNotices.map(n =>
          n.id === editingNotice.id
            ? {
                ...n,
                ...values,
                issuedDate: n.issuedDate, 
                expiryDate: values.expiryDate ? parseISO(values.expiryDate) : undefined,
              }
            : n
        ).sort((a,b) => b.issuedDate.getTime() - a.issuedDate.getTime())
      );
      toast({
        title: "Notice Updated",
        description: `"${values.title}" has been successfully updated.`,
      });
    } else {
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...values,
        issuedDate: new Date(),
        expiryDate: values.expiryDate ? parseISO(values.expiryDate) : undefined,
      };
      setNotices(prevNotices => [newNotice, ...prevNotices].sort((a,b) => b.issuedDate.getTime() - a.issuedDate.getTime()));
      toast({
        title: "Notice Created",
        description: `"${values.title}" has been successfully published.`,
      });
    }
    setShowModal(false);
    setEditingNotice(null);
  };

  const openAddModal = () => {
    setEditingNotice(null);
    form.reset({ author: user?.name || "Admin Office", title: "", content: "", expiryDate: "", noticeType: 'General', targetAudience: ['All'] });
    setShowModal(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setShowModal(true);
  };

  const handleDeleteConfirm = () => {
    if (noticeToDelete) {
      setNotices(prevNotices => prevNotices.filter(n => n.id !== noticeToDelete.id));
      toast({
        title: 'Notice Deleted',
        description: `Notice "${noticeToDelete.title}" has been removed.`,
        variant: 'destructive'
      });
      setNoticeToDelete(null);
    }
  };

  const activeNotices = notices.filter(notice => !notice.expiryDate || !isPast(notice.expiryDate)).sort((a,b) => b.issuedDate.getTime() - a.issuedDate.getTime());
  const expiredNotices = notices.filter(notice => notice.expiryDate && isPast(notice.expiryDate)).sort((a,b) => b.issuedDate.getTime() - a.issuedDate.getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">School Notices</h1>
          <p className="text-muted-foreground">Stay informed with the latest announcements. Admins can manage notices.</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Notice
          </Button>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(isOpen) => {
        setShowModal(isOpen);
        if (!isOpen) setEditingNotice(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingNotice ? "Edit Notice" : "Create New Notice"}</DialogTitle>
            <DialogDescription>
              {editingNotice ? "Update the details for this notice." : "Compose and publish a new school notice."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter notice title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter notice details" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Admin Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ? field.value.split('T')[0] : ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="noticeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Type/Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NOTICE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-2 border rounded-md">
                      {TARGET_AUDIENCES.map((audience) => (
                        <FormItem key={audience} className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(audience)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), audience])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== audience
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {audience}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 sticky bottom-0 bg-background py-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingNotice(null);}} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingNotice ? "Save Changes" : "Publish Notice"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!noticeToDelete} onOpenChange={(isOpen) => { if(!isOpen) setNoticeToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notice "{noticeToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoticeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notices.length === 0 ? (
         <Card className="text-center py-12">
          <CardHeader>
            <Megaphone className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <CardTitle className="font-headline mt-4">No Notices Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There are no active notices at the moment. {user?.role === 'admin' ? 'Try creating one!' : ''}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeNotices.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold font-headline mb-4 text-primary/90">Active Notices</h2>
              <div className="space-y-6">
                {activeNotices.map((notice) => (
                  <Card key={notice.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-xl mb-1">{notice.title}</CardTitle>
                        <Badge variant={notice.noticeType === 'Urgent' ? 'destructive': 'default'}>
                           {notice.noticeType || 'General'}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Issued by: {notice.author} on {format(notice.issuedDate, 'PPP')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{notice.content}</p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-start gap-2 pt-4">
                      <div className="space-y-1">
                        {notice.targetAudience && notice.targetAudience.length > 0 && (
                            <p className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                For: {notice.targetAudience.join(', ')}
                            </p>
                        )}
                        {notice.expiryDate && (
                          <p className="flex items-center">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Expires on: {format(notice.expiryDate, 'PPP')}
                          </p>
                        )}
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex gap-2 mt-2 sm:mt-0 self-end sm:self-center">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(notice)}>
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setNoticeToDelete(notice)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {expiredNotices.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold font-headline mb-4 text-muted-foreground">Expired Notices</h2>
              <div className="space-y-4">
                {expiredNotices.map((notice) => (
                  <Card key={notice.id} className="opacity-70 bg-muted/30">
                    <CardHeader>
                       <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-lg mb-1">{notice.title}</CardTitle>
                        <Badge variant="secondary">
                           {notice.noticeType || 'General'} (Expired)
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Issued by: {notice.author} on {format(notice.issuedDate, 'PPP')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{notice.content}</p>
                    </CardContent>
                     <CardFooter className="text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-start gap-2 pt-4">
                        <div className="space-y-1">
                            {notice.targetAudience && notice.targetAudience.length > 0 && (
                                <p className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    For: {notice.targetAudience.join(', ')}
                                </p>
                            )}
                            {notice.expiryDate && (
                                <p className="flex items-center">
                                <Info className="mr-2 h-4 w-4" />
                                Expired on: {format(notice.expiryDate, 'PPP')}
                                </p>
                            )}
                        </div>
                        {user?.role === 'admin' && (
                          <div className="flex gap-2 mt-2 sm:mt-0 self-end sm:self-center">
                            {/* Admin actions for expired notices can be added here if needed */}
                          </div>
                        )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
