import type { Metadata } from "next"
import LoginForm from "@/components/LoginForm"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <>
      <LoginForm />
    </>
  ) 
}