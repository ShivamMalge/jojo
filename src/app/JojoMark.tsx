interface JojoMarkProps {
  size?: number;
  /** Sets an accessible name; omit to hide the mark from screen readers. */
  title?: string;
  className?: string;
}

/**
 * The JoJo pinwheel: two identical hooks in 180-degree rotational symmetry.
 * The leading hook is always indigo; the trailing one inherits `currentColor`
 * so it reads as ink on a light header and cream on a dark one.
 */
export default function JojoMark({ size = 24, title, className }: JojoMarkProps) {
  const hook = 'M48 0V30A48 48 0 0 1 0 78';

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 134 134"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={hook} stroke="#6366F1" strokeWidth="24" />
      <path d={hook} stroke="currentColor" strokeWidth="24" transform="translate(74 44) rotate(180 30 45)" />
    </svg>
  );
}
