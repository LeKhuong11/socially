import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Toaster } from "react-hot-toast";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Socially",
  description: "Socially is a social media platform built with Next.js, Tailwind CSS, and JWT.",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();
  const headersList = headers();
  const domain = headersList.get('host') || "";
  const url = headersList.get('referer') || "";

  const hideSidebar = (url === `${domain}/${locale}/signin` || url === `${domain}/${locale}/signup`);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen">
          <Navbar />
          <main className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {!hideSidebar && (
                  <div className="hidden lg:block lg:col-span-3">
                    <Sidebar />
                  </div>
                )}
                <div className="lg:col-span-9">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
