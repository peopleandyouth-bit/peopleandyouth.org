"use client";

import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  variant = "primary",
}: ButtonProps) {
  const primary = {
    background: "#0EA5E9",
    color: "#fff",
    border: "none",
  };

  const secondary = {
    background: "transparent",
    color: "#fff",
    border: "1px solid #334155",
  };

  const style = variant === "primary" ? primary : secondary;

  return (
    <button
      style={{
        ...style,
        padding: "16px 30px",
        borderRadius: "14px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "0.3s ease",
        fontSize: "1rem",
      }}
    >
      {children}
    </button>
  );
}