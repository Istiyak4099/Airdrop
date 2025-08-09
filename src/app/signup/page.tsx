import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 z-0 bg-grid-purple-100/[0.05] dark:bg-grid-purple-900/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <SignupForm />
    </div>
  )
}
