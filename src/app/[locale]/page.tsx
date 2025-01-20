"use client"

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { ModeToggle } from '@/components/mode-toggle';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('Home');
  const { isSignedIn } =  useUser();

  console.log('user: ', isSignedIn);

  return (
    <div className=''>
        <div className=''>
        <SignedOut>
          <SignInButton mode='modal'>
            <Button>Sign in</Button>
          </SignInButton>
        </SignedOut>

        <SignedOut>
          <h2>logined</h2>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>

        <ModeToggle />
        </div>
        <div>
          <h1>{t('title')}</h1>
          <Link href="/about">{t('about')}</Link>
        </div>
    </div>
  );
}
