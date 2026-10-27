import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">404</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">This page could not be found.</h1>
          <p className="mt-3 max-w-md text-slate-body">It may have moved, or it may be restricted to approved members.</p>
          <Link href="/en" className="mt-6 rounded-md bg-brand-blue px-5 py-2.5 font-semibold text-white">
            Return home
          </Link>
        </main>
      </body>
    </html>
  );
}
