export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-3xl px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} MinGi. Powered by Notion.
      </div>
    </footer>
  );
}
