import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          MinGi
        </Link>
        <nav className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/posts" className="hover:text-gray-900 dark:hover:text-gray-100">
            Posts
          </Link>
          <Link href="/notes" className="hover:text-gray-900 dark:hover:text-gray-100">
            Notes
          </Link>
        </nav>
      </div>
    </header>
  );
}
