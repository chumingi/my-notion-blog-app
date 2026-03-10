import { notFound } from "next/navigation";
import { isNotionConnected } from "@/lib/notion/client";

type Props = {
  searchParams: Promise<{ secret?: string }>;
};

export default async function NotionConnectPage({ searchParams }: Props) {
  const { secret } = await searchParams;

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    notFound();
  }

  const connected = isNotionConnected();
  const startUrl = `/api/notion/start?secret=${encodeURIComponent(secret)}`;

  return (
    <main className="max-w-lg mx-auto mt-20 px-6">
      <h1 className="text-2xl font-semibold mb-2">Notion 연결</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Notion OAuth를 통해 내 워크스페이스와 연결합니다.
      </p>

      {connected ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <p className="font-medium text-green-800">연결됨</p>
          <p className="text-sm text-green-700 mt-1">
            <code className="bg-green-100 px-1 rounded">
              NOTION_ACCESS_TOKEN
            </code>{" "}
            이 설정되어 있습니다.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href={`/admin/import?secret=${encodeURIComponent(secret)}`}
              className="inline-block rounded bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
            >
              Import 페이지로 이동
            </a>
            <a
              href={startUrl}
              className="inline-block rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              재연결
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <p className="font-medium text-gray-800">미연결</p>
          <p className="text-sm text-gray-500 mt-1">
            Notion 워크스페이스와 연결되어 있지 않습니다.
          </p>
          <div className="mt-4">
            <a
              href={startUrl}
              className="inline-block rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
            >
              Notion 연결하기
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            연결 후 발급된 Access Token을{" "}
            <code className="bg-gray-200 px-1 rounded">.env.local</code>에
            저장하고 서버를 재시작하세요.
          </p>
        </div>
      )}
    </main>
  );
}
