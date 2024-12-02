import authConfig from "./auth.config"
import NextAuth from "next-auth"
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_REDIRECT_URL,
} from "./routes"

const {auth} = NextAuth(authConfig)
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  
  // Check if the current path matches any public route pattern
  const isPublicRoute = publicRoutes.some(route => {
    // Convert route pattern to regex
    // Replace [id] with a regex pattern that matches numbers
    const pattern = route.replace(/\[id\]/g, '\\d+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(nextUrl.pathname);
  });
  
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute){
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_REDIRECT_URL, nextUrl))
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    // Mengubah redirect ke halaman login
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return;
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
