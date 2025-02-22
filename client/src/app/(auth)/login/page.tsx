"use client"

import Link from 'next/link';
import { LoginForm } from '@/components/forms/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">AI Content</Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              AI Content ile içeriklerinizi yapay zeka destekli olarak oluşturun,
              yönetin ve yayınlayın.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Hesabınıza Giriş Yapın
            </h1>
            <p className="text-sm text-muted-foreground">
              E-posta adresiniz ve şifreniz ile giriş yapın
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Hemen Kaydolun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 