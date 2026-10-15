import {
  Armchair,
  Car,
  Cog,
  Cpu,
  Disc,
  Filter,
  Gauge,
  type LucideIcon,
  Snowflake,
  Sparkles,
  Thermometer,
  Wrench,
  Zap,
} from "lucide-react";

// Services and categories store an icon key in the DB; this maps it to a glyph.
const icons: Record<string, LucideIcon> = {
  armchair: Armchair,
  car: Car,
  cog: Cog,
  cpu: Cpu,
  disc: Disc,
  filter: Filter,
  gauge: Gauge,
  snowflake: Snowflake,
  sparkles: Sparkles,
  thermometer: Thermometer,
  wrench: Wrench,
  zap: Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Glyph = icons[name] ?? Wrench;
  return <Glyph className={className} aria-hidden />;
}
