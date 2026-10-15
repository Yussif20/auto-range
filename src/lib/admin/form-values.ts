// Echoes a submitted form back to the client after a validation error,
// so React's post-action form reset doesn't wipe what the user typed.
export type FormValues = Record<string, string | string[]>;

export function formValues(form: FormData, multi: string[] = []): FormValues {
  const out: FormValues = {};
  for (const key of new Set(form.keys())) {
    if (key.startsWith("$ACTION")) continue;
    out[key] = multi.includes(key) ? form.getAll(key).map(String) : String(form.get(key) ?? "");
  }
  for (const key of multi) out[key] ??= [];
  return out;
}
