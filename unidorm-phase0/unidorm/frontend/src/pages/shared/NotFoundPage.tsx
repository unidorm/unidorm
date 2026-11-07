import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <Link to="/" className="text-accent underline">
        Back to home
      </Link>
    </main>
  );
}
