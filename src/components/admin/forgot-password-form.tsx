"use client";

import { useState, type FormEvent } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Password reset is unavailable because Supabase is not configured.");
      return;
    }

    setIsPending(true);
    let sent = false;
    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` },
      );
      if (requestError) {
        setError("We could not send the reset email. Check the address and Supabase URL configuration, then try again.");
        return;
      }
      sent = true;
    } catch {
      setError("We could not send the reset email. Check the address and Supabase URL configuration, then try again.");
    } finally {
      setIsPending(false);
    }

    if (sent) {
      setMessage("If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.");
    }
  }

  return (
    <form onSubmit={requestReset} className="space-y-5">
      <div>
        <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-[var(--brand-navy)]">
          Email address
        </label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-navy-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[rgba(200,155,60,0.18)]"
          placeholder="admin@eliblessmanagers.com"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Sending reset link…" : "Send reset link"}
      </button>
    </form>
  );
}
