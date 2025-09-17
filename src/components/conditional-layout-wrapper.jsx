"use client";
import { usePathname } from "next/navigation";
import LayoutWrapper from "./layout-wrapper";

export default function ConditionalLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isManagePlan = pathname.startsWith("/manage-plan");
  return isManagePlan ? children : <LayoutWrapper>{children}</LayoutWrapper>;
} 