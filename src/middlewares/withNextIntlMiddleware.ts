import { NextRequest, NextFetchEvent, NextMiddleware } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '../i18n/routing';
import { MiddlewareFactory } from './chain';

export const withNextIntl: MiddlewareFactory = (next: NextMiddleware) => {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const response = await createIntlMiddleware(routing)(req);
    if (response) {
      return response;
    }
    return next(req, event);
  };
};
