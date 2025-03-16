import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("token", "", {
      expires: new Date(0), // Expire the cookie immediately
      path: "/", // Ensure it matches the path used when setting the cookie
    });
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
