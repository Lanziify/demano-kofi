"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

export default function VerifiedPage() {
  useEffect(() => {
    const channel = new BroadcastChannel("email-change-confirmation");

    channel.postMessage("email-change-confirmation");
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
          Email Updated Successfully
        </EmptyHeader>

        <EmptyDescription>
          Your email address has been successfully changed.
          <br />
          This window will close automatically.
        </EmptyDescription>
      </Empty>
    </div>
  );
}
