"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function NotFoundActions() {
  return (
    <div className="space-x-4">
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
}
