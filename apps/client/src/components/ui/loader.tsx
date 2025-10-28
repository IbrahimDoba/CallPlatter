import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function Loader({ 
  size = "md", 
  className, 
  text,
  variant = "spinner" 
}: LoaderProps) {
  const sizeClass = sizeClasses[size];

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("bg-primary rounded-full animate-pulse", sizeClass)} />
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          sizeClass
        )}
      />
      {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

interface LoadingScreenProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingScreen({ 
  message = "Loading...", 
  size = "lg",
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-white", className)}>
      <div className="text-center">
        <Loader size={size} />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingOverlay({ 
  message = "Loading...", 
  size = "md",
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn("flex items-center justify-center h-64", className)}>
      <div className="text-center space-y-4">
        <Loader size={size} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
