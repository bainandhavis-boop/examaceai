"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRef, useState } from "react";
import { InlineError } from "./components/InlineError";
import {
  type AppErrorContent,
  resolveAuthError,
  showErrorToast,
} from "./lib/errors";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const formRef = useRef<HTMLFormElement>(null);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<AppErrorContent | null>(null);

  const handlePasswordSignIn = (formData: FormData) => {
    setSubmitting(true);
    setAuthError(null);
    void signIn("password", formData)
      .catch((error) => {
        const content = resolveAuthError(error, flow);
        setAuthError(content);
        showErrorToast(content);
        setSubmitting(false);
      });
  };

  const handleAnonymousSignIn = () => {
    setAuthError(null);
    void signIn("anonymous").catch((error) => {
      const content = resolveAuthError(error, "signIn");
      setAuthError(content);
      showErrorToast(content);
    });
  };

  return (
    <div className="w-full">
      <form
        ref={formRef}
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          handlePasswordSignIn(formData);
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          required
          disabled={submitting}
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          required
          disabled={submitting}
        />

        {authError && (
          <InlineError
            {...authError}
            onRetry={() => {
              if (!formRef.current) return;
              const formData = new FormData(formRef.current);
              formData.set("flow", flow);
              handlePasswordSignIn(formData);
            }}
          />
        )}

        <button className="auth-button" type="submit" disabled={submitting}>
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => {
              setFlow(flow === "signIn" ? "signUp" : "signIn");
              setAuthError(null);
            }}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          Want to explore first? Start using ExamAce AI without creating an account.
        </p>
        <button
          type="button"
          className="auth-button"
          onClick={handleAnonymousSignIn}
          disabled={submitting}
        >
          Try Instantly No Registration Required
        </button>
      </div>
    </div>
  );
}
