
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Lightbulb, AlertTriangle, Wand2 } from 'lucide-react';
import { generateStudyQuestions, type GenerateStudyQuestionsInput, type GenerateStudyQuestionsOutput } from '@/ai/flows/generate-study-questions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';


export default function StudyQuestionsPage() {
  const { user } = useAuth();
  const [documentContent, setDocumentContent] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    if (!documentContent.trim()) {
      setError('Please enter some document content.');
      toast({
        title: "Input Required",
        description: "Document content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const input: GenerateStudyQuestionsInput = { documentContent };
      const result: GenerateStudyQuestionsOutput = await generateStudyQuestions(input);
      setQuestions(result.questions);
      toast({
        title: "Success!",
        description: `${result.questions.length} study questions generated.`,
      });
    } catch (e) {
      console.error('Error generating study questions:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate questions: ${errorMessage}`);
      toast({
        title: "Error Generating Questions",
        description: `An error occurred: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
             <Wand2 className="mr-3 h-8 w-8" /> Smart Study Questions
          </h1>
          <p className="text-muted-foreground">
            Generate insightful study questions from your documents using AI.
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Wand2 className="mr-2 h-6 w-6 text-primary" />
            Question Generator
          </CardTitle>
          <CardDescription>
            Paste your document content below, and our AI will create relevant study questions to help you learn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Textarea
              placeholder="Paste your document content here..."
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              rows={10}
              className="min-h-[200px] text-base"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-destructive flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4" /> {error}
              </p>
            )}
          </div>
          <Button onClick={handleGenerateQuestions} disabled={isLoading || !user } className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
            {!user && <p className="text-xs text-muted-foreground mt-1">Login to generate questions.</p>}
        </CardContent>
      </Card>

      {(questions.length > 0 || isLoading) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Generated Questions</CardTitle>
            <CardDescription>Review the questions generated from your document.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !questions.length ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md animate-pulse">
                    <Lightbulb className="h-5 w-5 text-primary/50" />
                    <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : questions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {questions.map((q, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start">
                        <Lightbulb className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="flex-1 text-sm">{`Question ${index + 1}: ${q.substring(0,100)}${q.length > 100 ? '...' : ''}`}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 text-muted-foreground">
                      {q}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

