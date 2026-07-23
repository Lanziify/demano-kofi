"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { Empty, EmptyHeader, EmptyDescription } from "@/components/ui/empty";

export default function VerifiedPage() {
  useEffect(() => {
    const channel = new BroadcastChannel("email-verification");

    channel.postMessage("email-verified");
    channel.close();

    const timer = setTimeout(() => {
      window.close();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <CheckCircle2 />
          Email Verified
        </EmptyHeader>
        <EmptyDescription>
          Your email has been successfully verified.
          <br />
          This window will close automatically.
        </EmptyDescription>
      </Empty>
    </div>
  );
}
