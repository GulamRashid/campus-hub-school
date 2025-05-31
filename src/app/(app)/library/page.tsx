
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Edit, Trash2, BookMarked, BookOpenCheck, Users2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  totalCopies: number;
  availableCopies: number;
}

const bookFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  author: z.string().min(2, { message: "Author name must be at least 2 characters." }),
  isbn: z.string().optional().refine(val => !val || /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(val), {
    message: "Invalid ISBN format (10 or 13 digits, can include hyphens)."
  }),
  totalCopies: z.coerce.number().positive({ message: "Total copies must be a positive number." }),
  availableCopies: z.coerce.number().nonnegative({ message: "Available copies cannot be negative." }),
}).refine(data => data.availableCopies <= data.totalCopies, {
  message: "Available copies cannot exceed total copies.",
  path: ["availableCopies"],
});

type BookFormValues = z.infer<typeof bookFormSchema>;

const initialBooks: Book[] = [
  { id: 'BK001', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', totalCopies: 10, availableCopies: 7 },
  { id: 'BK002', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', totalCopies: 15, availableCopies: 12 },
  { id: 'BK003', title: '1984', author: 'George Orwell', isbn: '978-0451524935', totalCopies: 8, availableCopies: 5 },
  { id: 'BK004', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', totalCopies: 12, availableCopies: 12 },
];

export default function LibraryManagementPage(): ReactNode {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      totalCopies: 1,
      availableCopies: 1,
    },
  });

  useEffect(() => {
    if (editingBook) {
      form.reset(editingBook);
    } else {
      form.reset({
        title: '',
        author: '',
        isbn: '',
        totalCopies: 1,
        availableCopies: 1,
      });
    }
  }, [editingBook, form, showBookModal]);

  const handleFormSubmit = (values: BookFormValues) => {
    if (editingBook) {
      setBooks(prevBooks =>
        prevBooks.map(b => (b.id === editingBook.id ? { ...b, ...values } : b))
      );
      toast({
        title: 'Book Updated',
        description: `Book "${values.title}" updated successfully.`,
      });
    } else {
      const newBook: Book = {
        id: `BK${Date.now().toString().slice(-4)}`,
        ...values,
      };
      setBooks(prevBooks => [...prevBooks, newBook]);
      toast({
        title: 'Book Added',
        description: `New book "${values.title}" added successfully.`,
      });
    }
    setShowBookModal(false);
    setEditingBook(null);
  };

  const openAddModal = () => {
    setEditingBook(null);
    form.reset({ title: '', author: '', isbn: '', totalCopies: 1, availableCopies: 1 });
    setShowBookModal(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setShowBookModal(true);
  };

  const handleDeleteConfirm = () => {
    if (bookToDelete) {
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookToDelete.id));
      toast({
        title: 'Book Deleted',
        description: `Book "${bookToDelete.title}" has been removed from the catalog.`,
        variant: 'destructive',
      });
      setBookToDelete(null);
    }
  };
  
  const sortedBooks = useMemo(() => {
    return [...books].sort((a,b) => a.title.localeCompare(b.title));
  }, [books]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <BookMarked className="mr-3 h-8 w-8" /> Library Management
          </h1>
          <p className="text-muted-foreground">
            Manage book catalog, track issues/returns, and member activity.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
          </Button>
        )}
      </div>

      <Dialog open={showBookModal} onOpenChange={(isOpen) => { setShowBookModal(isOpen); if (!isOpen) setEditingBook(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Enter book title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl><Input placeholder="Enter author's name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., 978-0743273565" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCopies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Copies</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableCopies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Copies</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 7" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowBookModal(false); setEditingBook(null); }} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingBook ? 'Save Changes' : 'Add Book'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!bookToDelete} onOpenChange={(isOpen) => { if (!isOpen) setBookToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book: "{bookToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Book Catalog</CardTitle>
          <CardDescription>List of all books available in the library.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookMarked className="mx-auto h-16 w-16 opacity-50" />
              <p className="mt-4 text-lg font-semibold">No Books in Catalog</p>
              <p>{user?.role === 'admin' ? "Start by adding new books to the catalog." : "The library catalog is currently empty."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead className="text-center">Total Copies</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.isbn || '-'}</TableCell>
                      <TableCell className="text-center">{book.totalCopies}</TableCell>
                      <TableCell className="text-center">{book.availableCopies}</TableCell>
                      {user?.role === 'admin' && (
                        <TableCell className="text-right space-y-1 sm:space-y-0 sm:space-x-1">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(book)} className="w-full sm:w-auto">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setBookToDelete(book)} className="w-full sm:w-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
                <BookOpenCheck className="mr-2 h-5 w-5 text-primary" />
                Book Issue & Return
            </CardTitle>
            <CardDescription>Track borrowed books and manage returns.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-6 text-center">
              Functionality for issuing books, recording returns, managing due dates, and calculating fines will be available here. (Coming Soon)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center">
                <Users2 className="mr-2 h-5 w-5 text-primary" />
                Member Management
            </CardTitle>
            <CardDescription>Manage library members (students and staff).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-6 text-center">
              Functionality for managing library member profiles, membership status, and borrowing history will be available here. (Coming Soon)
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

