import { z } from "zod";

// Egyptian or international numbers; spaces and dashes are ignored.
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{8,15}$/));
