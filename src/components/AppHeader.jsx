import { Link, useLocation } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';

export default function AppHeader() {
  const { pathname } = useLocation();
  const isFormPage = pathname.startsWith('/new') || pathname.startsWith('/edit');

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft transition-transform duration-300 group-hover:-rotate-6">
            <NotebookPen size={18} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">Tasuku</span>
        </Link>
        {!isFormPage && (
          <Link
            to="/new"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-accent-deep hover:shadow-md active:translate-y-0"
          >
            書き込む
          </Link>
        )}
      </div>
    </header>
  );
}
