import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
    // Public routes that don't require authentication
    publicRoutes: ["/", "/sign-in", "/sign-up"],

    // Routes that can be accessed while signed out
    ignoredRoutes: ["/api/webhook/clerk"],
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ],
};