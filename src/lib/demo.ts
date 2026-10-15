// The public portfolio copy runs the same code with DEMO_MODE=1:
// one-click admin access, no real contact numbers, nightly reset, not indexed.
export function isDemo() {
  return process.env.DEMO_MODE === "1";
}
