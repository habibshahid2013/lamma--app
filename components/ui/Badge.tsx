import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal/20",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-600 hover:bg-gray-200",
        active: "bg-teal text-white hover:bg-teal-deep",
        outline: "border border-gray-200 text-gray-500 hover:bg-gray-50",
        ghost: "hover:bg-gray-100 text-gray-500",
      },
      size: {
        xs: "px-2 py-0.5 text-[10px]",
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-sm",
      },
      fullWidth: {
        true: "w-full justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      fullWidth: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  active?: boolean;
}

export default function Badge({ className, variant, size, fullWidth, active, ...props }: BadgeProps) {
  const finalVariant = active ? "active" : variant;
  
  return (
    <div className={badgeVariants({ variant: finalVariant, size, fullWidth, className })} {...props} />
  );
}
