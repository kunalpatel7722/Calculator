'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { validateEmail, type EmailValidationInput, type EmailValidationOutput } from '@/ai/flows/email-validation';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Login data:", data);
    toast({ title: "Login Successful", description: "Welcome back!" });
    setIsSubmitting(false);
    // loginForm.reset(); // Typically redirect after login
  };

  const handleSignup: SubmitHandler<SignupFormData> = async (data) => {
    setIsSubmitting(true);
    setEmailValidationError(null);

    try {
      const emailValidationResult: EmailValidationOutput = await validateEmail({ email: data.email });
      if (!emailValidationResult.isValid) {
        setEmailValidationError(emailValidationResult.reason || "Invalid or disposable email address.");
        signupForm.setError("email", { type: "manual", message: emailValidationResult.reason || "Invalid or disposable email address." });
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Signup data:", data);
      toast({ title: "Signup Successful", description: "Welcome to InvestAI! Please check your email to verify your account." });
      // signupForm.reset(); // Typically redirect after signup
    } catch (error) {
      console.error("Signup error:", error);
      toast({ title: "Signup Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
              <CardDescription>Login to access your InvestAI account.</CardDescription>
            </CardHeader>
            <form onSubmit={loginForm.handleSubmit(handleLogin)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" {...loginForm.register('email')} placeholder="you@example.com" />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" {...loginForm.register('password')} placeholder="••••••••" />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">
                  Forgot your password? <Button variant="link" type="button" className="p-0 h-auto text-xs">Reset it here</Button>
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
              <CardDescription>Join InvestAI to start making smarter financial decisions.</CardDescription>
            </CardHeader>
            <form onSubmit={signupForm.handleSubmit(handleSignup)}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" type="text" {...signupForm.register('name')} placeholder="Your Name" />
                  {signupForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" {...signupForm.register('email')} placeholder="you@example.com" />
                  {signupForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>}
                  {emailValidationError && !signupForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{emailValidationError}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" {...signupForm.register('password')} placeholder="••••••••" />
                  {signupForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.password.message}</p>}
                </div>
                <div>
                  <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                  <Input id="signup-confirmPassword" type="password" {...signupForm.register('confirmPassword')} placeholder="••••••••" />
                  {signupForm.formState.errors.confirmPassword && <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
