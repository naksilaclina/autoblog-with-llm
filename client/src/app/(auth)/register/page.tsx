"use client"

import Link from 'next/link';
import { RegisterForm } from '@/components/forms/auth/RegisterForm';

export default function RegisterPage() {
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
              Yeni Hesap Oluşturun
            </h1>
            <p className="text-sm text-muted-foreground">
              Bilgilerinizi girerek hemen hesap oluşturun
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 