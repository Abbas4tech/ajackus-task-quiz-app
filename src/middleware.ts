import { getToken } from "next-auth/jwt";
import { MiddlewareConfig, NextMiddleware, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

export const middleware: NextMiddleware = async (request) => {
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
  });

  const url = request.nextUrl;

  if (url.pathname === "/" && token && token.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (url.pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
};

export const config: MiddlewareConfig = {
  matcher: ["/", "/admin/:path*"],
};
