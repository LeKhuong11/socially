import { chain } from "./middlewares/chain";
import { withClerk } from "./middlewares/withClerkMiddleware";
import { withNextIntl } from "./middlewares/withNextIntlMiddleware";

const middlewares = [withNextIntl, withClerk];
export default chain(middlewares);

export const config = {
  matcher: [
    // Exclude internal Next.js files and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Match only internationalized pathnames
    '/', '/(vi|en)/:path*'
  ],
};