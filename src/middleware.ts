import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    const token = request.cookies.get("auth-token")?.value;
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {}
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
