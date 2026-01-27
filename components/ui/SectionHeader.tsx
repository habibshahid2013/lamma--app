import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  href?: string;
  emoji?: string;
}

export default function SectionHeader({ title, subtitle, action, onAction, href, emoji }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between px-4 mb-4">
      <div>
        <h3 className="font-bold text-gray-dark text-lg flex items-center">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
        </h3>
        {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && href ? (
        <Link href={href} className="text-teal text-xs font-semibold pb-1">
          {action}
        </Link>
      ) : action && onAction ? (
        <button onClick={onAction} className="text-teal text-xs font-semibold pb-1">
          {action}
        </button>
      ) : null}
    </div>
  );
}
