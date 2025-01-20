import { NextRequest, NextFetchEvent, NextMiddleware } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { MiddlewareFactory } from './chain';

export const withClerk: MiddlewareFactory = (next: NextMiddleware) => {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)']);

    const response = await clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const authObject = await auth();
        if (!authObject.userId) {
          return authObject.redirectToSignIn();
        }
      }
    })(req, event);

    if (response) {
      return response;
    }
    return next(req, event);
  };
};