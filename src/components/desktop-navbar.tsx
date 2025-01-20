'use client'

import { BellIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
// import LocalSwitcher from "./local-switcher";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";

function DesktopNavbar() {
    const { user } = useUser();
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

    const handleLanguageChange = (lang: string) => {
      setSelectedLanguage(lang);
      router.replace(`/${lang}`);
    };
    
    return (
      <div className="hidden md:flex items-center space-x-4">
        <ModeToggle />

        <Button variant="ghost" className="flex items-center gap-2" asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="btn">Lang: {selectedLanguage}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                <DropdownMenuCheckboxItem checked={selectedLanguage === 'en'} onCheckedChange={() => handleLanguageChange('en')}>
                  English
                </DropdownMenuCheckboxItem>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('vi')}>
                <DropdownMenuCheckboxItem checked={selectedLanguage === 'vi'} onCheckedChange={() => handleLanguageChange('vi')}>
                  Vietnamese
                </DropdownMenuCheckboxItem>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </Button>

        {user ? (
          <>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link href="/notifications">
                <BellIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Notifications</span>
              </Link>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link
                href={`/profile/${
                  user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Profile</span>
              </Link>
            </Button>
            <UserButton />
          </>
        ) : (
          <SignInButton mode="modal">
            <Button variant="default">Sign In</Button>
          </SignInButton>
        )}
      </div>
    );
}

export default DesktopNavbar;
