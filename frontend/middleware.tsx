import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // Replace with your session or JWT logic

  // Check if the request is for a protected route (e.g., /dashboard)
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    // If no token exists, return a 403 Forbidden response
    if (!token) {
      return new NextResponse("Access Denied", { status: 403 });
    }
  }

  // Allow the request to proceed if authenticated or not accessing a protected route
  return NextResponse.next();
}
