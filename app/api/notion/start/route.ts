import { type NextRequest, NextResponse } from "next/server";
import { buildOAuthUrl, generateState } from "@/lib/notion/oauth";

/**
 * GET /api/notion/start?secret=...
 * Validates admin secret, generates CSRF state, sets cookie, redirects to Notion OAuth.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = generateState();
  const oauthUrl = buildOAuthUrl(state);

  const response = NextResponse.redirect(oauthUrl);

  // Store state in httpOnly cookie for CSRF verification on callback
  response.cookies.set("notion_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
