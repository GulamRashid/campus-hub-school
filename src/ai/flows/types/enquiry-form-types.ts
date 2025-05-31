
import { z } from 'zod';

export const EnquiryFormInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email format."),
  phone: z.string().optional(),
  classInterested: z.string().min(1, "Class interested in is required."),
  message: z.string().min(1, "Message is required."),
});
export type EnquiryFormInput = z.infer<typeof EnquiryFormInputSchema>;

export const EnquiryFormOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type EnquiryFormOutput = z.infer<typeof EnquiryFormOutputSchema>;
