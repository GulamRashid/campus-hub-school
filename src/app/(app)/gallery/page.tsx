
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Image as ImageIcon, Edit, Trash2, Filter, ArrowDownUp } from 'lucide-react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  imageHint: string;
  date: string; // ISO string date for sorting
  eventTag?: string;
}

const galleryFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).optional(), // Optional, defaults to placeholder
  imageHint: z.string().min(1, "Image hint is required.").refine(
    (value) => {
      const words = value.trim().split(/\s+/);
      return words.length >= 1 && words.length <= 2;
    },
    { message: "Hint must be one or two words (e.g., 'sports children', 'science fair')." }
  ),
  eventTag: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

const initialGalleryItems: GalleryItem[] = [
  { id: '1', title: 'Annual Sports Day', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'sports children', date: '2024-03-15', eventTag: 'Sports' },
  { id: '2', title: 'Science Fair Exhibition', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'science experiment', date: '2024-04-22', eventTag: 'Academics' },
  { id: '3', title: 'Art & Craft Workshop', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'art craft', date: '2024-05-10', eventTag: 'Workshop' },
  { id: '4', title: 'Graduation Ceremony', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'graduation students', date: '2024-06-01', eventTag: 'Ceremony' },
  { id: '5', title: 'Cultural Fest', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'cultural dance', date: '2023-11-20', eventTag: 'Culture' },
  { id: '6', title: 'Tree Plantation Drive', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'tree planting', date: '2023-09-05', eventTag: 'Social' },
];

export default function GalleryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>("newest");

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      imageHint: "",
      eventTag: "",
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        title: editingItem.title,
        imageUrl: editingItem.imageUrl,
        imageHint: editingItem.imageHint,
        eventTag: editingItem.eventTag || "",
      });
    } else {
      form.reset({ title: "", imageUrl: "", imageHint: "", eventTag: "" });
    }
  }, [editingItem, form, showCreateEditModal]);

  const openCreateModal = () => {
    setEditingItem(null);
    form.reset({ title: "", imageUrl: "", imageHint: "", eventTag: "" });
    setShowCreateEditModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setShowCreateEditModal(true);
  };

  const handleFormSubmit = (values: GalleryFormValues) => {
    const finalImageUrl = values.imageUrl || 'https://placehold.co/600x400.png';

    if (editingItem) {
      setGalleryItems(prevItems =>
        prevItems.map(item =>
          item.id === editingItem.id ? { ...item, ...values, imageUrl: finalImageUrl, date: item.date } : item
        )
      );
      toast({
        title: "Gallery Item Updated",
        description: `"${values.title}" has been successfully updated.`,
      });
    } else {
      const newGalleryItem: GalleryItem = {
        id: Date.now().toString(),
        ...values,
        imageUrl: finalImageUrl,
        date: new Date().toISOString().split('T')[0],
      };
      setGalleryItems(prevItems => [newGalleryItem, ...prevItems]);
      toast({
        title: "Gallery Item Created",
        description: `Gallery item "${values.title}" has been successfully created.`,
      });
    }
    setShowCreateEditModal(false);
    setEditingItem(null);
    form.reset();
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setGalleryItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      toast({
        title: 'Gallery Item Deleted',
        description: `"${itemToDelete.title}" has been removed.`,
        variant: 'destructive'
      });
      setItemToDelete(null);
    }
  };

  const uniqueEventTags = useMemo(() => {
    const tags = new Set(galleryItems.map(item => item.eventTag).filter(Boolean) as string[]);
    return ['all', ...Array.from(tags)];
  }, [galleryItems]);

  const processedGalleryItems = useMemo(() => {
    let items = [...galleryItems];
    if (eventFilter !== "all") {
      items = items.filter(item => item.eventTag === eventFilter);
    }
    items.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return items;
  }, [galleryItems, eventFilter, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">School Gallery</h1>
          <p className="text-muted-foreground">Memories from school events and activities.</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Gallery Item
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:min-w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by event..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueEventTags.map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag === 'all' ? 'All Events' : tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={toggleSortOrder} className="w-full sm:w-auto">
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Sort by Date ({sortOrder === 'newest' ? 'Newest First' : 'Oldest First'})
        </Button>
      </div>

      <Dialog open={showCreateEditModal} onOpenChange={(isOpen) => {
        setShowCreateEditModal(isOpen);
        if (!isOpen) setEditingItem(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingItem ? "Edit Gallery Item" : "Create New Gallery Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details for this gallery item." : "Provide details for your new gallery item. You can specify an image URL or a placeholder will be used."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Annual Day 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png or leave blank for placeholder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Hint (1-2 words)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., sports children" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Tag (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sports, Academics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {setShowCreateEditModal(false); setEditingItem(null);}} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto">{editingItem ? "Save Changes" : "Create Item"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(isOpen) => {if(!isOpen) setItemToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gallery item "{itemToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {processedGalleryItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <CardTitle className="font-headline mt-4">No Gallery Items Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {eventFilter === 'all' && galleryItems.length === 0 
                ? "Start by creating a new gallery item to share school memories."
                : `No gallery items match the current filter "${eventFilter === 'all' ? 'All Events' : eventFilter}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {processedGalleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group flex flex-col">
              <CardHeader className="p-0 relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                  onError={(e) => {
                    // Fallback for broken image URLs
                    (e.target as HTMLImageElement).srcset = 'https://placehold.co/600x400.png?text=Image+Error';
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400.png?text=Image+Error';
                  }}
                />
                 {item.eventTag && (
                  <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
                    {item.eventTag}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-1">{item.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                 {/* The View Gallery Item button seems less relevant now that all info is on card, can remove or make it open a larger view modal in future */}
                 {/* <Button variant="outline" size="sm" className="w-full">View Gallery Item</Button> */}
                 {user?.role === 'admin' && (
                   <div className="flex flex-col sm:flex-row w-full gap-2">
                     <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(item)}>
                       <Edit className="mr-2 h-3 w-3" /> Edit
                     </Button>
                     <Button variant="destructive" size="sm" className="flex-1" onClick={() => setItemToDelete(item)}>
                       <Trash2 className="mr-2 h-3 w-3" /> Delete
                     </Button>
                   </div>
                 )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
