"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}
