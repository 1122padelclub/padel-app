import { cn } from "@/lib/utils"

export interface LiquidGlassProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "subtle" | "strong" | "colored"
  blur?: "sm" | "md" | "lg" | "xl"
}

export function LiquidGlass({ 
  children, 
  className, 
  variant = "default",
  blur = "md" 
}: LiquidGlassProps) {
  const baseClasses = "backdrop-blur-md border border-white/20"
  
  const variantClasses = {
    default: "bg-white/10 shadow-lg",
    subtle: "bg-white/5 shadow-sm",
    strong: "bg-white/20 shadow-xl",
    colored: "bg-gradient-to-br from-white/20 to-white/10 shadow-lg"
  }
  
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  }

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        blurClasses[blur],
        "rounded-2xl transition-all duration-300 hover:shadow-xl hover:bg-white/15",
        className
      )}
    >
      {children}
    </div>
  )
}

export function LiquidGlassCard({ 
  children, 
  className, 
  variant = "default",
  blur = "md" 
}: LiquidGlassProps) {
  return (
    <LiquidGlass 
      variant={variant} 
      blur={blur}
      className={cn("p-6", className)}
    >
      {children}
    </LiquidGlass>
  )
}

export function LiquidGlassButton({ 
  children, 
  className, 
  variant = "default",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "secondary" | "ghost" }) {
  const baseClasses = "backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 font-medium transition-all duration-300"
  
  const variantClasses = {
    default: "bg-white/10 hover:bg-white/20 text-gray-800",
    primary: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-900 border-blue-300/30",
    secondary: "bg-gray-500/20 hover:bg-gray-500/30 text-gray-800 border-gray-300/30",
    ghost: "bg-transparent hover:bg-white/10 text-gray-700 border-transparent"
  }

  return (
    <button 
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
