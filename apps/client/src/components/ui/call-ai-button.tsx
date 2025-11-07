"use client";

import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface CallAIButtonProps {
  phoneNumber?: string;
  displayNumber?: string;
  text?: string;
  className?: string;
  showIcon?: boolean;
}

export function CallAIButton({
  phoneNumber = "+17344156557",
  displayNumber = "+1 734-415-6557",
  text = "Call our AI receptionist",
  className = "",
  showIcon = true,
}: CallAIButtonProps) {
  return (
    <ShimmerButton background="bg-transparent" className={className}>
      <Link
        href={`tel:${phoneNumber}`}
        className="inline-flex items-center rounded-full font-semibold text-sm"
      >
        {showIcon && <Phone className="mr-2" size={16} />}
        <span>
          {text} {displayNumber}
        </span>
      </Link>
    </ShimmerButton>
  );
}

