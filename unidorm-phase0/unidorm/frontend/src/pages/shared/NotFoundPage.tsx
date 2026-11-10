import { ButtonLink } from "../../components/ui";
import { ROUTES } from "../../config/routes";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
      <p className="max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <ButtonLink to={ROUTES.student.home}>Student home</ButtonLink>
        <ButtonLink to={ROUTES.manager.rooms} variant="outline">
          Housing manager rooms
        </ButtonLink>
      </div>
    </main>
  );
}
