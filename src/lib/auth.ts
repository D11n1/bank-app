import { supabase } from "./supabase";
import { useAuthStore } from "@/store/auth";

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (data?.user) {
    // Create a default checking account request for the new user
    await supabase.from("account_requests").insert([
      {
        user_id: data.user.id,
        account_type: "checking",
        status: "pending",
      },
    ]);

    // Update the auth store
    const { user: currentUser } = await getCurrentUser();
    useAuthStore.getState().setUser(currentUser);
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error) {
    const { user: currentUser } = await getCurrentUser();
    useAuthStore.getState().setUser(currentUser);
  }

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    useAuthStore.getState().setUser(null);
  }
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user: { ...user, profile }, error: null };
  }
  return { user: null, error };
};
