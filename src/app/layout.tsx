import { AppProvider } from "./context-provider";

function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {  
  return <AppProvider>
      {children}
    </AppProvider>;
}

export default RootLayout
