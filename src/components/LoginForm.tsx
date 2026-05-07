"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCsrfToken, signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";

export default function LoginForm() {
  // const [name, setName] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Please check your email and password and try again.",
      });
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Login Successful",
      text: "You will be redirected to the homepage.",
    }).then(() => {
      router.push("/");
    });
  }

  async function handleGoogleLogin() {
    try {
      setIsGoogleLoading(true);
      const csrfToken = await getCsrfToken();

      if (!csrfToken) {
        throw new Error("Missing CSRF token");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/signin/google";

      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "csrfToken";
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      const callbackInput = document.createElement("input");
      callbackInput.type = "hidden";
      callbackInput.name = "callbackUrl";
      callbackInput.value = "/";
      form.appendChild(callbackInput);

      document.body.appendChild(form);
      form.submit();
    } catch {
      setIsGoogleLoading(false);
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text: "Unable to start Google login. Please try again.",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-800 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mt-2">Login to your account</p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="text-gray-400 text-sm">OR</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
