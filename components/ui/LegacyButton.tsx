import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  children,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-deep shadow-md",
    secondary: "bg-gold text-gray-dark hover:bg-yellow-400",
    outline: "border-2 border-teal text-teal hover:bg-teal-light",
    ghost: "text-teal hover:bg-teal-light",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
