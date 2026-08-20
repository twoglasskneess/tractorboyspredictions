import middleware from "next-auth/middleware";

export default function proxy(req: any, ctx: any) {
  return (middleware as any)(req, ctx);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
