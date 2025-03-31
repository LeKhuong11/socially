"use client"

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { signInSchema } from './validation'
import { signIn } from '@/actions/user.action'
import { useAppContext } from '@/app/context-provider'
import { useRouter } from 'next/navigation'
import { User } from '@prisma/client'

function SignIn() {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
    const [clientErrors, setClientErrors] = useState<{ [key: string]: string[] }>({})
    const { user, setUser } = useAppContext();
    const router = useRouter();

    console.log(user);
    

    const handleSubmit = (formData: FormData) => {
        // Reset errors
        setClientErrors({})
        setProcessing(true)
        
        // Validate form data
        const result = signInSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })
    
        if (!result.success) {
            const formattedErrors: { [key: string]: string[] } = {}
            result.error.errors.forEach((error) => {
                const path = error.path[0].toString()
                if (!formattedErrors[path]) {
                formattedErrors[path] = []
                }
                formattedErrors[path].push(error.message)
            })
            
            setClientErrors(formattedErrors)
            setProcessing(false)
            return
        }
    
        signIn(formData)
            .then((serverResult) => {
                console.log(serverResult);
                
                if (serverResult?.errors) {
                    setErrors(serverResult.errors)
                }
                if (serverResult.user) {
                    const user: User = {
                        id: serverResult.user.id,
                        email: serverResult.user.email,
                        username: serverResult.user.username,
                        name: serverResult.user.name ?? null,
                        password: '',
                        bio: serverResult.user.bio ?? null,
                        image: serverResult.user.image ?? null,
                        location: serverResult.user.location ?? null,
                        website: serverResult.user.website ?? null,
                        createdAt: new Date(serverResult.user.createdAt),
                        updatedAt: new Date(serverResult.user.updatedAt),
                    }
                    setUser(user.id ? user : null)
                } else {
                    setUser(null)
                }
                setProcessing(false)
                router.push('/')
                
            }).catch(() => {
                setProcessing(false)
            })
    }

    const handleInputChange = (field: string, value: string) => {
        const result = signInSchema.safeParse({
            email: field === 'email' ? value : '',
            password: field === 'password' ? value : '',
        })
    
        if (!result.success) {
            const fieldError = result.error.errors.find((error) => error.path[0] === field)
            if (fieldError) {
                setClientErrors((prev) => ({
                ...prev,
                [field]: [fieldError.message],
                }))
            }
            } else {
                setClientErrors((prev) => ({
                    ...prev,
                    [field]: [],
                }))
            }
      }
    
  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6' >
        <div className="lg:col-span-6">
            <div className="logo flex justify-center py-5">
                <Link href="/" className="text-3xl font-bold text-primary font-mono tracking-wider">
                    Socially
                </Link>
            </div>
            <form className="flex flex-col gap-4" onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleSubmit(formData)
            }}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                       {(clientErrors.email || errors.email)?.map((error) => (
                            <p key={error} className="mt-1 text-sm text-red-600">
                            {error}
                            </p>
                        ))}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Password"
                        />
                        {(clientErrors.password || errors.password)?.map((error) => (
                            <p key={error} className="mt-1 text-sm text-red-600">
                            {error}
                            </p>
                        ))}
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            // checked={data.remember}
                            // onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="" tabIndex={5}>
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    </div>
  )
}

export default SignIn
