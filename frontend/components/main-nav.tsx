"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/data-entry", label: "Data Entry" },
  { href: "/resources", label: "Resources" },
  { href: "/plan-visit", label: "Plan Visit" },
  { href: "/chatbot", label: "AI Assistant" },
  { href: "/speech", label: "Speech Analysis" },
  { href: "#", label: "Logout", action: true }, // Add action flag for logout
];

export function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      const response = await fetch("/api/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      // Redirect to login page after successful logout
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="text-lg font-bold">Parker</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
        {navItems.map((item) =>
          item.action ? (
            <button
              key={item.label}
              onClick={handleLogout}
              className={cn(
                "text-sm font-medium hover:underline underline-offset-4",
                pathname === item.href && "text-primary font-semibold"
              )}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium hover:underline underline-offset-4",
                pathname === item.href && "text-primary font-semibold"
              )}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* Mobile Menu Button */}
      <div className="ml-auto md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-background border-b md:hidden">
          <nav className="flex flex-col p-4">
            {navItems.map((item) =>
              item.action ? (
                <button
                  key={item.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className={cn(
                    "py-3 px-4 text-sm font-medium hover:bg-muted rounded-md",
                    pathname === item.href && "bg-muted text-primary font-semibold"
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-3 px-4 text-sm font-medium hover:bg-muted rounded-md",
                    pathname === item.href && "bg-muted text-primary font-semibold"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </>
  );
}
