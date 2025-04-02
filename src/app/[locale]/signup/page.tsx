"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { signUpSchema } from './validation'
import { signUp } from '@/actions/user.action'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function SignUp() {
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string[] }>({})

  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setClientErrors({})
    setProcessing(true)
    
    const result = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
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
    
    signUp(formData)
      .then((serverResult) => {
        if (serverResult?.success) {
          router.push('/signin')
          toast.success(serverResult.message || "Sign-up successfully!")
        }
      }).catch((serverResult) => {
        toast.error(serverResult.message || "Sign-up fail. Please try again!")
        setErrors(serverResult.errors || {})
      });
  }

  const handleInputChange = (field: string, value: string, formElement: HTMLFormElement) => {
    const formData = new FormData(formElement)
    formData.set(field, value)

    const result = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })
    
    if (!result.success) {
      const fieldErrors = result.error.errors
        .filter((error) => error.path[0] === field)
        .map((error) => error.message)

      if (fieldErrors.length > 0) {
        setClientErrors((prev) => ({
          ...prev,
          [field]: fieldErrors,
        }))
      } else {
        setClientErrors((prev) => ({
          ...prev,
          [field]: [],
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
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
      <div className="lg:col-span-6">
        <div className="logo flex justify-center py-5">
          <Link href="/" className="text-3xl font-bold text-primary font-mono tracking-wider">
            Socially
          </Link>
        </div>
        <form className="flex flex-col gap-4" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          
          handleSubmit(formData);
        }}>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                required
                autoFocus
                tabIndex={1}
                autoComplete="name"
                onChange={(e) => handleInputChange('name', e.target.value, e.target.form!)}
                placeholder="Nguyễn Văn A"
              />
              {(clientErrors.name || errors.name)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            {/* Trường Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                tabIndex={2}
                autoComplete="email"
                onChange={(e) => handleInputChange('email', e.target.value, e.target.form!)}
                placeholder="example@gmail.com"
              />
              {(clientErrors.email || errors.email)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                tabIndex={3}
                autoComplete="new-password"
                onChange={(e) => handleInputChange('password', e.target.value, e.target.form!)}
                placeholder="Mật khẩu"
              />
              {(clientErrors.password || errors.password)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
                tabIndex={4}
                autoComplete="new-password"
                onChange={(e) => handleInputChange('confirmPassword', e.target.value, e.target.form!)}
                placeholder="Xác nhận mật khẩu"
              />
              {(clientErrors.confirmPassword || errors.confirmPassword)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            {/* Nút Đăng ký */}
            <Button type="submit" className="mt-4 w-full" tabIndex={6} disabled={processing}>
              {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </div>

          {/* Liên kết đến trang đăng nhập */}
          <div className="text-muted-foreground text-center text-sm">
            Đã có tài khoản?{' '}
            <Link href="/login" tabIndex={7}>
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp
