'use client'

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signOut({
        redirect: false,
      });

      router.push('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
