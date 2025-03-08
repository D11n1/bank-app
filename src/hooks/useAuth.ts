import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return { user, loading };
}
