import createMiddleware from 'next-intl/middleware';
import { routingConfig } from './i18n';

export default createMiddleware(routingConfig);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
