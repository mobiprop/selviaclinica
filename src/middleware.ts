import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured yet — let requests through. /login shows setup
  // instructions instead of a broken sign-in form in that case.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/reset-password");
  const isPendingRoute = pathname.startsWith("/pending-approval");
  // Exact match only — this is the MCP protocol endpoint itself, which
  // authenticates via its own Bearer key instead of a browser session.
  // Everything else under /api/mcp/* (like /api/mcp/token) must still go
  // through the normal cookie-session check below.
  const isMcpRoute = pathname === "/api/mcp";

  if (!user && !isAuthRoute && !isMcpRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // A freshly-registered account already holds a valid session before an
  // admin approves it — gate every other route on approval status here too,
  // not just at the RLS layer, so an unapproved user's first click doesn't
  // land on a half-rendered dashboard.
  //
  // Fails open on a genuine query error (e.g. migration 0003 hasn't been
  // applied yet, so the `status` column doesn't exist) rather than treating
  // it as "not approved" — RLS is the real enforcement boundary either way,
  // this is just the UX-level redirect, and failing closed here would lock
  // every existing user (including the admin) out the instant this code
  // deploys ahead of that migration.
  if (user && !isMcpRoute) {
    const { data: profile, error } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();

    if (!error) {
      const approved = profile?.status === "approved";
      if (!approved && !isPendingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/pending-approval";
        return NextResponse.redirect(url);
      }
      if (approved && isPendingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
