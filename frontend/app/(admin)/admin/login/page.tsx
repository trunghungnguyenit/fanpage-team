import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  // LoginForm đọc tham số trên URL nên cần Suspense.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
