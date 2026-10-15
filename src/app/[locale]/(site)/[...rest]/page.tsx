import { notFound } from "next/navigation";

// Always 404s, so there's no instant UI to validate.
export const instant = false;

// Unknown paths under a locale render the branded 404 inside the site layout.
export default function CatchAll() {
  notFound();
}
