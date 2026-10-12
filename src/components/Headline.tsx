import type { Headline as HeadlineType } from "@/content/types";
import { cn } from "@/lib/cn";

type Tone = "cream" | "ink" | "on-red";

const plain: Record<Tone, string> = { cream: "text-cream", ink: "text-ink", "on-red": "text-cream" };
// On the red field the uncomfortable line turns black: red on red would vanish.
const accent: Record<Tone, string> = { cream: "text-red", ink: "text-red", "on-red": "text-ink" };

type Props = {
  lines: HeadlineType;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  tone?: Tone;
  /** Staggered mask reveal on load (hero use). */
  reveal?: boolean;
  id?: string;
};

/**
 * Brand headline pattern (guide p.7): a plain statement in black or cream,
 * then the uncomfortable part in red. Anton, capitals, full stop.
 */
export function Headline({ lines, as: Tag = "h2", className, tone = "cream", reveal, id }: Props) {
  return (
    <Tag id={id} className={cn("display", className)}>
      {lines.map((line, i) => {
        const colour = line.accent ? accent[tone] : plain[tone];
        // The trailing space keeps words apart in the accessible name ("Biraz rahatsız olalım").
        const gap = i < lines.length - 1 ? " " : null;
        if (reveal) {
          return (
            <span key={i} className="mask-line" style={{ ["--line" as string]: i }}>
              <span className={colour}>{line.text}</span>
              {gap}
            </span>
          );
        }
        return (
          <span key={i} className={cn("block", colour)}>
            {line.text}
            {gap}
          </span>
        );
      })}
    </Tag>
  );
}
