"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        address,
        phoneNumber: phone,
        password,
      }),
    });
    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "Please check your input and try again.",
      });
      return;
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!loginResult || loginResult.error) {
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Your account is ready. Please login to continue.",
      }).then(() => {
        router.push("/login");
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Registration Successful",
      text: "Your account has been created. You will be redirected to the homepage.",
    }).then(() => {
      router.push("/");
    });
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-3/4 max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Sign up
        </h2>

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="off"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="address" className="block text-sm mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              placeholder="Enter your full address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-bold"
          >
            Sign up
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have account?{" "}
          <Link
            href="/login"
            className="text-blue-900 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
