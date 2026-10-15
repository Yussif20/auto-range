"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "@/components/ui/button";

export function SubmitButton({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, "md", className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
