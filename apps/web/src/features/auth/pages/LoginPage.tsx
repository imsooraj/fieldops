import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../../../lib/api-client";
import { login } from "../api/auth-api";
import type { LoginDTO } from "../types/auth";

import "./LoginPage.css";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginDTO) => login(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["current-user"], user);
      navigate("/app/dashboard", { replace: true });
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      loginMutation.reset();
      await loginMutation.mutateAsync(values);
    } catch (error) {
      console.error("Unable to sign in:", error);
    }
  };

  const errorMessage =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.error instanceof Error
        ? loginMutation.error.message
        : "Something went wrong. Please try again.";

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand">
            <div className="login-brand-icon">F</div>
            <span>FieldOps</span>
          </div>

          <div className="login-brand-message">
            <span className="login-eyebrow">FIELD SERVICE MANAGEMENT</span>

            <h1>
              Keep your field
              <br />
              operations moving.
            </h1>

            <p>
              One workspace to manage work orders, coordinate teams,
              and keep every service operation on track.
            </p>
          </div>

          <div className="login-brand-footer">
            <span className="login-status-dot" />
            Built for teams that keep work moving.
          </div>
        </div>

        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />
      </section>

      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <div className="login-brand-icon">F</div>
            <span>FieldOps</span>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your workspace.</p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="login-field">
              <label htmlFor="email">Work email</label>

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />

              {errors.email && (
                <span className="login-field-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="login-field">
              <div className="login-password-label">
                <label htmlFor="password">Password</label>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <span className="login-field-error">
                  {errors.password.message}
                </span>
              )}
            </div>

            {loginMutation.isError && (
              <div className="login-error-banner" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <p className="login-security-note">
            Your workspace is protected with secure session authentication.
          </p>
        </div>

        <footer className="login-footer">
          <span>© {new Date().getFullYear()} FieldOps</span>
          <span>Field operations, simplified.</span>
        </footer>
      </section>
    </main>
  );
}

export default LoginPage;