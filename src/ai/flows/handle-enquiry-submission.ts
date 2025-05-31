
'use server';

/**
 * @fileOverview Handles submission of admission enquiry forms.
 *
 * - handleEnquirySubmission - Conceptually processes an enquiry.
 * - EnquiryFormInput - The input type for the handleEnquirySubmission function.
 * - EnquiryFormOutput - The return type for the handleEnquirySubmission function.
 */

import { ai } from '@/ai/genkit';
// Import schemas and types from the new types file
import { EnquiryFormInputSchema, EnquiryFormOutputSchema } from './types/enquiry-form-types';
import type { EnquiryFormInput as EnquiryFormInputType, EnquiryFormOutput as EnquiryFormOutputType } from './types/enquiry-form-types';

// Re-export ONLY the types, as per Genkit conventions for 'use server' files
export type EnquiryFormInput = EnquiryFormInputType;
export type EnquiryFormOutput = EnquiryFormOutputType;

// This is a conceptual flow. In a real application, this would
// - Save the enquiry to a database (e.g., Firestore).
// - Send an email notification to the admin.
// - Send a confirmation email to the user.
// As a Genkit flow, it might also perform some AI-based analysis or categorization of the enquiry.
const enquiryHandlerFlow = ai.defineFlow(
  {
    name: 'enquiryHandlerFlow',
    inputSchema: EnquiryFormInputSchema, // Schema is used here internally
    outputSchema: EnquiryFormOutputSchema, // Schema is used here internally
  },
  async (input: EnquiryFormInput) => { // input type is EnquiryFormInput (the re-exported type)
    console.log('New enquiry received:', JSON.stringify(input, null, 2));

    // Simulate processing, e.g., saving to DB, sending emails.
    // For now, we just acknowledge receipt.
    // An LLM could be used here to draft a polite acknowledgement or categorize the enquiry.
    
    // Example: Using an LLM to generate a slightly more dynamic acknowledgement
    // (This is a simple example, more complex logic could be added)
    /*
    const { output: llmResponse } = await ai.generate({
        prompt: `A user named ${input.fullName} submitted an admission enquiry for class ${input.classInterested}. Briefly and politely acknowledge their enquiry. Mention their name.`,
        model: 'googleai/gemini-2.0-flash', // Ensure correct model
        config: { temperature: 0.3 }
    });
    
    const acknowledgementMessage = llmResponse?.text || `Thank you for your enquiry, ${input.fullName}. We have received your message regarding class ${input.classInterested} and will get back to you shortly.`;
    */
    
    // For simplicity in this step, we'll use a static message.
    // Genkit LLM calls can be added later if needed for more complex responses.
    const acknowledgementMessage = `Thank you for your enquiry, ${input.fullName}. We have received your message regarding class ${input.classInterested} and will get back to you shortly.`;


    return {
      success: true,
      message: acknowledgementMessage,
    };
  }
);

export async function handleEnquirySubmission(input: EnquiryFormInput): Promise<EnquiryFormOutput> {
  // Add validation or pre-processing if needed before calling the flow
  // For instance, ensure required fields are truly present beyond Zod's client-side check
  // if (!input.fullName || !input.email || !input.classInterested || !input.message) {
  //   return { success: false, message: "Missing required fields." };
  // }
  return enquiryHandlerFlow(input);
}
