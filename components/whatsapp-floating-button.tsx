"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

export function WhatsAppFloatingButton() {
  return (
    <a
      href="https://whatsapp.com/channel/0029Vb7KseUKGGGOTKZv1A0G"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
      style={{
        background: "linear-gradient(135deg, oklch(0.65 0.18 155), oklch(0.7 0.15 145))",
        width: "56px",
        height: "56px",
      }}
      aria-label="Join WhatsApp Community"
      title="Join our WhatsApp Community"
    >
      {/* Pulse animation ring */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: "oklch(0.7 0.18 155 / 0.2)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Inner glow */}
      <div
        className="absolute inset-1 rounded-full"
        style={{
          background: "linear-gradient(135deg, oklch(0.7 0.18 155 / 0.3), transparent)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Icon */}
      <MessageCircle className="relative h-6 w-6 text-white fill-white" />

      {/* Tooltip on hover */}
      <div
        className="absolute -top-14 right-0 px-4 py-2 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg"
        style={{
          background: "oklch(0.1 0.02 255 / 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid oklch(0.7 0.05 240 / 0.2)",
        }}
      >
        Join Community
      </div>
    </a>
  )
}
