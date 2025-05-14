// src/components/StartButton.tsx
import { Button as UIButton } from "@/components/ui/button";
import "./index.css";
import { cn } from "@/lib/utils";
import React from "react";

interface PixelButtonProps extends React.ComponentProps<typeof UIButton> {
  pixel?: boolean;
  dynamic?: boolean;
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, pixel = true, dynamic = false, children, ...props }, ref) => {
    if (dynamic) {
      return (
        <UIButton
          className={cn(
            "new-pixel-button text-white bg-transparent hover:bg-transparent shadow-none p-0 ",
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-center bg-[rgb(58,68,102)] w-full text-shadow-lg">
            {children}
          </div>
        </UIButton>
      );
    }
    if (pixel) {
      return (
        <UIButton
          ref={ref}
          className={cn(
            "pixel-button text-white rounded-none border-none p-0 bg-transparent hover:bg-transparent shadow-none text-shadow-lg",
            className
          )}
          variant="default"
          {...props}
        >
          {children}
        </UIButton>
      );
    }

    return (
      <UIButton ref={ref} className={className} {...props}>
        {children}
      </UIButton>
    );
  }
);
PixelButton.displayName = "PixelButton";

export default PixelButton;
