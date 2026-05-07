"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

function BurgerMenuDesktop({
  handleLogout,
  isUser,
  userId,
}: {
  handleLogout: () => void;
  isUser: boolean;
  userId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ml-4">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-100 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        type="button"
      >
        <svg
          className="w-6 h-6 text-blue-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
        </svg>
      </button>

      <div
        className={`absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 transform transition-all duration-200 origin-top-right ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <Link
          href="/profile"
          className="block px-5 py-2 text-sm text-gray-700 hover:bg-blue-50 font-medium"
          onClick={() => setOpen(false)}
        >
          Profile
        </Link>
        <Link
          href="/bookinglist"
          className="block px-5 py-2 text-sm text-gray-700 hover:bg-blue-50 font-medium"
          onClick={() => setOpen(false)}
        >
          List Booking
        </Link>
        {isUser && userId && (
          <Link
            href={`/formbrief/${userId}`}
            className="block px-5 py-2 text-sm text-gray-700 hover:bg-blue-50 font-medium"
            onClick={() => setOpen(false)}
          >
            Form Brief
          </Link>
        )}
        <button
          onClick={() => {
            setOpen(false);
            handleLogout();
          }}
          className="block w-full text-left px-5 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const qnaHref = session ? "/qna" : "/login";
  const sessionRole = String(session?.user?.role || "").toLowerCase();

  const isPsychiatrist =
    sessionRole === "doctor" || sessionRole === "psychiatrist";
  const isUser = sessionRole === "user";
  const userId = session?.user?.id as string | undefined;
  const brandTitle = isPsychiatrist ? "pendengarMu - Dokter" : "pendengarMu";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-blue-900 tracking-tighter">
          <Link href="/" className="">
            {brandTitle}
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-500 hover:text-blue-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/listpsikolog"
            className="text-gray-500 hover:text-blue-700 transition-colors"
          >
            List Psikolog
          </Link>
          <Link
            href="/aboutus"
            className="text-gray-500 hover:text-blue-700 transition-colors"
          >
            Tentang kami
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={qnaHref}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md hidden sm:block"
          >
            Konseling Sekarang
          </Link>

          {/* mobile menu toggle (Hamburger) */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="block w-5 h-0.5 bg-gray-700 rounded" />
            <span className="block w-5 h-0.5 bg-gray-700 rounded" />
            <span className="block w-5 h-0.5 bg-gray-700 rounded" />
          </button>

          {/* Profile Menu - Hidden on Mobile, Visible on Desktop */}
          {session ? (
            <div className="hidden md:block">
              <BurgerMenuDesktop
                handleLogout={handleLogout}
                isUser={isUser}
                userId={userId}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md hidden sm:block"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>

      {/* mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-lg">
          <Link
            href="/"
            className="block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/listpsikolog"
            className="block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            List Psikolog
          </Link>
          <Link
            href="/aboutus"
            className="block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            Tentang kami
          </Link>

          {session && (
            <Link
              href="/bookinglist"
              className="block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              List Booking
            </Link>
          )}

          {session && isUser && userId && (
            <Link
              href={`/formbrief/${userId}`}
              className="block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Form Brief
            </Link>
          )}

          {session ? (
            <>
              <Link
                href="/profile"
                className="block py-3 text-sm font-medium text-blue-600 border-b border-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="cursor-pointer block w-full text-left py-3 text-sm font-medium text-red-600 border-b border-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="cursor-pointer block py-3 text-sm font-medium text-gray-600 border-b border-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Masuk / Daftar
            </Link>
          )}

          <Link
            href={qnaHref}
            className="cursor-pointer mt-4 block w-full py-3 bg-orange-500 text-white font-bold rounded-xl text-center"
            onClick={() => setMenuOpen(false)}
          >
            Konseling Sekarang
          </Link>
        </div>
      )}
    </nav>
  );
}
