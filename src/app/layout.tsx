import type { ReactNode } from "react";

/** Pass-through root — `<html lang>` and CSS live in `[locale]/layout`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
