"use client"

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'

function Login() {
    const [processing, setProcessing] = React.useState(false);

    useEffect(() => {
        setProcessing(false);
    }, []);
  return (
    <div>
      <form className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            // value={data.email}
                            // onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        {/* <InputError message={errors.email} /> */}
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            // value={data.password}
                            // onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        {/* <InputError message={errors.password} /> */}
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
  )
}

export default Login
