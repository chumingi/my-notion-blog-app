import { type NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/notion/oauth";

/**
 * GET /api/notion/callback?code=...&state=...
 * Called by Notion after OAuth approval.
 * Verifies state, exchanges code for access token, shows result to user.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // OAuth denied by user
  if (error) {
    return buildResultPage({
      success: false,
      message: `Notion OAuth denied: ${error}`,
    });
  }

  if (!code || !state) {
    return buildResultPage({
      success: false,
      message: "Missing code or state parameter.",
    });
  }

  // CSRF state verification
  const storedState = request.cookies.get("notion_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return buildResultPage({
      success: false,
      message: "Invalid state parameter. CSRF check failed.",
    });
  }

  try {
    const token = await exchangeCodeForToken(code);

    // Clear state cookie
    const response = buildResultPage({
      success: true,
      accessToken: token.access_token,
      workspaceName: token.workspace_name,
    });
    response.cookies.delete("notion_oauth_state");
    return response;
  } catch (err) {
    return buildResultPage({
      success: false,
      message: err instanceof Error ? err.message : "Unknown error occurred.",
    });
  }
}

type ResultOptions =
  | { success: true; accessToken: string; workspaceName: string }
  | { success: false; message: string };

function buildResultPage(opts: ResultOptions): NextResponse {
  if (!opts.success) {
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notion 연결 실패</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 24px; }
    .card { border: 1px solid #fca5a5; background: #fef2f2; border-radius: 8px; padding: 24px; }
    h1 { color: #dc2626; margin-top: 0; }
    p { color: #7f1d1d; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <h1>연결 실패</h1>
    <p>${escapeHtml(opts.message)}</p>
    <p><a href="/notion/connect">돌아가기</a></p>
  </div>
</body>
</html>`;
    return new NextResponse(html, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notion 연결 완료</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 24px; }
    .card { border: 1px solid #86efac; background: #f0fdf4; border-radius: 8px; padding: 24px; }
    h1 { color: #16a34a; margin-top: 0; }
    .token-box {
      background: #1e1e1e; color: #a8ff78; font-family: monospace;
      padding: 16px; border-radius: 6px; word-break: break-all;
      font-size: 14px; margin: 16px 0;
    }
    .step { background: #fff; border: 1px solid #d1fae5; border-radius: 6px; padding: 16px; margin: 12px 0; }
    .step p { margin: 4px 0; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    a { color: #2563eb; }
    .warn { color: #92400e; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Notion 연결 완료</h1>
    <p>워크스페이스 <strong>${escapeHtml(opts.workspaceName)}</strong> 와 연결되었습니다.</p>

    <p class="warn">⚠️ 아래 Access Token을 안전한 곳에 복사하세요. 이 페이지를 벗어나면 다시 볼 수 없습니다.</p>

    <div class="token-box">${escapeHtml(opts.accessToken)}</div>

    <div class="step">
      <p><strong>1단계</strong> — <code>.env.local</code> 파일에 아래 줄을 추가하세요:</p>
      <div class="token-box">NOTION_ACCESS_TOKEN=${escapeHtml(opts.accessToken)}</div>
    </div>

    <div class="step">
      <p><strong>2단계</strong> — 개발 서버를 재시작하세요:</p>
      <div class="token-box">pnpm dev</div>
    </div>

    <div class="step">
      <p><strong>3단계</strong> — <a href="/admin/import">Admin Import 페이지</a>에서 Notion 데이터를 가져오세요.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
