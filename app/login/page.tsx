"use client";

import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Initialize the client manually (This bypasses the error)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Check if already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/"); // Redirect to dashboard if logged in
      }
    };
    checkSession();
  }, [router]);

  // Handle the redirect after login
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-card shadow-premium relative z-10">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
            TJ
          </div>
          <h1 className="text-2xl font-bold text-text-main">Welcome Back</h1>
          <p className="text-text-muted">Sign in to sync your trades.</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  inputText: '#e2e8f0', // Lighter text for inputs
                  inputBackground: 'rgba(0,0,0,0.3)',
                  inputBorder: 'rgba(255,255,255,0.1)',
                  inputLabelText: '#94a3b8', // Muted text for labels
                },
              },
            },
            className: {
              button: 'rounded-lg font-bold',
              input: 'rounded-lg text-white', // Force text to be white
              label: 'text-sm font-medium',
            }
          }}
          theme="dark"
          providers={[]} // Add 'google' here later if needed
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        />
      </div>
    </div>
  );
}