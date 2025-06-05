import smartGenEduXLogo from "@assets/SmartGenEduX_20250518_005919_0000_1749139146444.jpg";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={smartGenEduXLogo} 
        alt="SmartGenEduX Logo" 
        className={`${sizeClasses[size]} object-contain rounded-lg`}
      />
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-blue-600 dark:text-blue-400`}>
            SmartGenEduX
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">
            HAPPY AUTOMATION
          </p>
        </div>
      )}
    </div>
  );
}