'use client'

import { BellIcon, Globe, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
                  user.username ?? user.email.split("@")[0]
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">{t("Profile")}</span>
              </Link>
            </Button>
          </>
        ) : (
            <Button variant="default">
              <Link href={'/signin'}>Sign In</Link>
            </Button>
        )}
      </div>
    );
}

export default DesktopNavbar;
