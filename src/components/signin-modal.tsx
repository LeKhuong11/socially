import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/app/context-provider';
import toast from 'react-hot-toast';
import { signIn } from '@/actions/user.action';
import { signInSchema } from '@/app/[locale]/signin/validation';
import { LoaderCircle } from 'lucide-react';


function SignInModal({children}: {children: React.ReactNode}) {
    const [processing, setProcessing] = useState(false);
    const [clientErrors, setClientErrors] = useState<{ [key: string]: string[] }>({});
    const { setUser } = useAppContext();

    const handleSubmit = (formData: FormData) => {
        setClientErrors({});
        setProcessing(true);
    
        const result = signInSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
        });
    
        if (!result.success) {
          const formattedErrors: { [key: string]: string[] } = {};
          result.error.errors.forEach((error: import("zod").ZodIssue) => {
            const path = error.path[0].toString();
            if (!formattedErrors[path]) formattedErrors[path] = [];
            formattedErrors[path].push(error.message);
          });
    
          setClientErrors(formattedErrors);
          setProcessing(false);
          return;
        }
    
        signIn(formData)
          .then((serverResult) => {
        
            if (serverResult.user) {
              const user = {
                id: serverResult.user.id,
                email: serverResult.user.email,
                username: serverResult.user.username,
                name: serverResult.user.name ?? null,
                bio: serverResult.user.bio ?? null,
                image: serverResult.user.image ?? null,
                location: serverResult.user.location ?? null,
                website: serverResult.user.website ?? null,
                createdAt: new Date(serverResult.user.createdAt),
                updatedAt: new Date(serverResult.user.updatedAt),
              };
              setUser(user.id ? user : null);
            } else {
              setUser(null);
            }
            toast.success(serverResult.message || "Sign in successfully!");
          })
          .catch(() => {
            setProcessing(false);
          });
      };

  return (
    <div>
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                <DialogTitle>Sign in</DialogTitle>
                </DialogHeader>
                <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleSubmit(formData);
                }}
                >
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="email@example.com"
                    />
                    {clientErrors.email?.map((error) => (
                    <p key={error} className="text-sm text-red-600">
                        {error}
                    </p>
                    ))}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    />
                    {clientErrors.password?.map((error) => (
                    <p key={error} className="text-sm text-red-600">
                        {error}
                    </p>
                    ))}
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Log in
                </Button>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default SignInModal
