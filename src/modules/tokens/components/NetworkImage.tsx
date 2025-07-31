import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface NetworkImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  showXOnError?: boolean;
}

export function NetworkImage({
  src,
  alt,
  width = 24,
  height = 24,
  className,
  fallback,
  showXOnError = true,
}: NetworkImageProps) {
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className="relative" style={{ width, height }}>
      {/* Use client-fetched image to reduce nextjs server bandwidth load */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "rounded-full transition-opacity duration-200",
          hasError && "invisible",
          className
        )}
        onError={handleError}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
          {fallback ? (
            fallback
          ) : showXOnError ? (
            <X className="w-3 h-3 text-gray-400" />
          ) : null}
        </div>
      )}
    </div>
  );
}
