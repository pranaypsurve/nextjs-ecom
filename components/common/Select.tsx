"use client";

import { Select as AntSelect, SelectProps as AntSelectProps } from "antd";

export interface SelectProps extends AntSelectProps {}

// Simple wrapper - ref forwarding can be added if needed
const Select = (props: SelectProps) => {
  return <AntSelect {...props} />;
};

export default Select;
