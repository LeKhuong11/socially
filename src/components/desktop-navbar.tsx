'use client'

import { BellIcon, Globe, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
import LocaleSwitcher from "./local-switcher";
import { useLocale, useTranslations } from "next-intl";
import { useAppContext } from "@/app/context-provider";

function DesktopNavbar() {
    const { user } = useAppContext();
    const locale = useLocale();
    const t = useTranslations('Sidebar');

    return (
      <div className="hidden md:flex items-center space-x-4">
        <ModeToggle />

        <Button variant="ghost" className="flex items-center gap-2" asChild>
        <div className='flex items-center gap-1'>
          <Globe className='h-2 w-2 text-muted-foreground' />
          <LocaleSwitcher defaultValue={locale} label='Select a locale' />
        </div>
        </Button>

        {user ? (
          <>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link href="/notifications">
                <BellIcon className="w-4 h-4" />
                <span className="hidden lg:inline">{t("Notifications")}</span>
              </Link>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link
                href={`/profile/${
                  user.username ?? (user.email ? user.email.split("@")[0] : user.name)
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">{t("Profile")}</span>
              </Link>
            </Button>
            <UserButton />
          </>
        ) : (
          <SignInButton mode="modal">
            <Button variant="default">Login</Button>
          </SignInButton>
        )}
      </div>
    );
}

export default DesktopNavbar;
