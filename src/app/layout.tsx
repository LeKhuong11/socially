import localFont from "next/font/local";
import { AppProvider } from "./context-provider";
import "./globals.css";
 
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppProvider>
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
    <head>
          <link rel="icon" href="/images/logo.jpg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Socially - A place to connect and share your moments." />
          <meta name="keywords" content="Social media, Social network, connect, share" />
          <meta name="author" content="Khuong" />
          
          <meta property="og:title" content="Socially" />
          <meta property="og:description" content="A place to connect and share your moments." />
          <meta property="og:image" content="/images/logo.jpg" />
          <meta property="og:type" content="website" />
          
          <title>Socially</title>
        </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  </AppProvider>;
}

export default RootLayout
