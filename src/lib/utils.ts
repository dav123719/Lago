// Simplified cn function for combining class names
// Can be replaced with clsx + tailwind-merge when those packages are installed
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
