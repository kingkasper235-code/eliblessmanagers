"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/lib/admin-actions";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--brand-navy)]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm text-[var(--brand-navy-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[rgba(200,155,60,0.18)]"
          placeholder="admin@eliblessmanagers.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--brand-navy)]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-[var(--brand-border)] bg-white px-4 py-3 pr-12 text-sm text-[var(--brand-navy-dark)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[rgba(200,155,60,0.18)]"
            placeholder="••••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--brand-muted)] transition hover:text-[var(--brand-navy)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-[rgba(200,155,60,0.3)] bg-[rgba(200,155,60,0.08)] px-4 py-3 text-sm text-[var(--brand-navy)]">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-gold)] hover:text-[var(--brand-navy-dark)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
