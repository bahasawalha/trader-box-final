"use client";

import { usePathname } from "next/navigation";
import UserHeader from "./UserHeader";

export default function HeaderWrapper() {
  const pathname = usePathname();
  
  // Hide header on admin and provider dashboards
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/provider');
  
  if (isDashboard) return null;
  
  return <UserHeader />;
}
