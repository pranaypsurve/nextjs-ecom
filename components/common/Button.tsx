"use client";

import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { forwardRef } from "react";

export interface ButtonProps extends Omit<AntButtonProps, "type" | "variant"> {
  variant?: "primary" | "secondary" | "default" | "dashed" | "text" | "link";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", ...props }, ref) => {
    const type = variant === "primary" ? "primary" : variant === "secondary" ? "default" : variant;
    return (
      <AntButton
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
