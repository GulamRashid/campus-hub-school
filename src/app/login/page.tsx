
'use client';

import { useState } from 'react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LogoIcon from '@/components/icons/LogoIcon';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from 'next/link';

const roles: UserRole[] = ['admin', 'teacher', 'student', 'parent', 'accountant', 'principal', 'librarian'];

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Basic validation for mock, real validation with Firebase
  role: z.enum(roles, { errorMap: () => ({ message: "Please select a role."}) }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false); // Conceptual for future OTP
  const [otp, setOtp] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: undefined,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call for mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real Firebase Auth implementation, you'd call something like:
    // firebaseSignIn(values.email, values.password, values.role)
    // which would then handle onAuthStateChanged to set the user.
    // For now, we pass email as name to the mock login.
    login(values.email, values.password, values.role); 
    // setShowOtpInput(true); // Uncomment this line if you want to test OTP UI flow conceptually
    // setIsLoading(false); // login function handles navigation
  };

  const handleOtpSubmit = async () => {
    setIsLoading(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("OTP Submitted:", otp); 
    // Here you would verify OTP and complete login
    // For mock: login(form.getValues("email"), form.getValues("role")); 
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <LogoIcon className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">Welcome to Campus Hub</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpInput ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role} className="capitalize">
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          ) : (
            // Conceptual OTP Input Section
            <div className="space-y-6">
              <p className="text-center text-muted-foreground">
                An OTP has been sent to your registered email/phone.
              </p>
              <FormItem>
                <FormLabel>Enter OTP</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </FormControl>
                {/* <FormMessage /> conceptual place for OTP error */}
              </FormItem>
              <Button onClick={handleOtpSubmit} className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
              </Button>
              <Button variant="link" onClick={() => setShowOtpInput(false)} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Campus Hub. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
