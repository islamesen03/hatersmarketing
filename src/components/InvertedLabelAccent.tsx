import { cn } from "@/lib/cn";

/**
 * A red label with its text flipped top-to-bottom — the brand's "ters" idea used as a
 * decorative accent. It is NOT the logo and must never spell "TERS" or imitate the mark.
 * Decorative only: the readable text is provided separately via `srText`.
 */
export function InvertedLabelAccent({
  children,
  srText,
  className,
}: {
  children: React.ReactNode;
  srText: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center bg-red px-[0.12em] text-cream", className)}>
      <span aria-hidden="true" className="inline-block -scale-y-100">
        {children}
      </span>
      <span className="sr-only">{srText}</span>
    </span>
  );
}
