"use client";

import { Input as AntInput, InputProps as AntInputProps, InputRef } from "antd";
import { forwardRef } from "react";

export interface InputProps extends AntInputProps {}

const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  return <AntInput ref={ref} {...props} />;
});

Input.displayName = "Input";

export default Input;
