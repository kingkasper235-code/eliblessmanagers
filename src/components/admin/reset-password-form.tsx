"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { hasSupabaseConfig } from "@/lib/supabase";
import {
  createBrowserSupabaseClient,
  hasActivePasswordRecoverySession,
} from "@/lib/supabase-browser";

type RecoveryState =
  | "checking"
  | "ready"
  | "invalid"
  | "unavailable"
  | "unconfigured"
  | "success";

export function ResetPasswordForm() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>(
    hasSupabaseConfig ? "checking" : "unconfigured",
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "PASSWORD_RECOVERY" && session?.user) {
          setRecoveryState("ready");
        } else if (event === "PASSWORD_RECOVERY") {
          setRecoveryState("invalid");
        }
      },
    );
    const timeout = window.setTimeout(() => {
      setRecoveryState((current) =>
        current === "checking" ? "invalid" : current,
      );
    }, 15000);
    void hasActivePasswordRecoverySession().then((hasRecoverySession) => {
      if (hasRecoverySession) setRecoveryState("ready");
    }).catch((caughtError: unknown) => {
      console.error("[admin-password-reset] Recovery session check failed", {
        reason: caughtError instanceof Error ? caughtError.name : "unknown",
      });
      setRecoveryState((current) =>
        current === "checking" ? "unavailable" : current,
      );
    });

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setRecoveryState("unconfigured");
      return;
    }

    setIsPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError("Your password could not be updated. The reset link may have expired; request a new one and try again.");
        setIsPending(false);
        return;
      }
    } catch {
      setError("Your password could not be updated. The reset link may have expired; request a new one and try again.");
      setIsPending(false);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");

    let sessionCleared = false;
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      sessionCleared = !error;
    } catch (caughtError) {
      console.error("[admin-password-reset] Session sign-out failed", {
        reason: caughtError instanceof Error ? caughtError.name : "unknown",
      });
    }
    if (!sessionCleared) {
      setRecoveryState("success");
      setError("Your password was updated, but this session could not be cleared. Use the login link below and sign in with your new password.");
      setIsPending(false);
      return;
    }

    window.location.replace("/admin/login?success=password-updated");
  }

  if (recoveryState === "checking") {
    return (
      <p role="status" className="border border-[var(--brand-border)] bg-[var(--brand-offwhite)] px-4 py-3 text-sm leading-6 text-[var(--brand-muted)]">
        Checking your secure password reset link…
      </p>
    );
  }

  if (recoveryState === "unconfigured") {
    return (
      <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
        Password reset is unavailable because Supabase is not configured.
      </p>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <div className="space-y-4">
        <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          This password reset link is invalid, expired, or already used. Request a new link to continue.
        </p>
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (recoveryState === "unavailable") {
    return (
      <div className="space-y-4">
        <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          We could not validate this recovery link right now. Request a new link or try again when your connection is available.
        </p>
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (recoveryState === "success") {
    return (
      <div className="space-y-4">
        <p role="status" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          Your password has been updated.
        </p>
        {error ? (
          <p role="alert" className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {error}
          </p>
        ) : null}
        <Link
          href="/admin/login?success=password-updated"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)]"
        >
          Continue to admin login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={updatePassword} className="space-y-5">
      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[var(--brand-navy)]">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-navy-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[rgba(200,155,60,0.18)]"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[var(--brand-navy)]">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-navy-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[rgba(200,155,60,0.18)]"
        />
      </div>
      {error ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending || recoveryState !== "ready"}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? "Updating password…" : "Update password"}
      </button>
    </form>
  );
}
