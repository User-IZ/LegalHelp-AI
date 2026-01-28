import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Public routes that don't require authentication
  const publicPaths = ["/", "/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Protected routes that require authentication AND VKYC
  const vkycRequiredPaths = [
    "/library",

    "/publish-report",
    "/profile",
  ];
  const isVKYCRequiredPath = vkycRequiredPaths.some((path) =>
    pathname.startsWith(path)
  );

  // VKYC route (requires auth but not VKYC completion)
  const isVKYCPath = pathname === "/vkyc";

  console.log("Route analysis:", {
    pathname,
 
  // If token exists, validate it
  if (token && (isVKYCRequiredPath || isVKYCPath)) {
    try {
      const validateResponse = await fetch(
        new URL("/api/auth/validate", request.url),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
  }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
