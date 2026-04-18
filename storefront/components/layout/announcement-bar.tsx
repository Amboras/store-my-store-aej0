'use client'

import { useState } from 'react'
import { X, Truck, Gift, Coffee } from 'lucide-react'

const messages = [
  { icon: Truck, text: 'Free shipping on orders over $50' },
  { icon: Gift, text: 'Use code WELCOME15 — 15% off your first order' },
  { icon: Coffee, text: 'Roasted to order · shipped within 48 hours' },
]

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-foreground text-primary-foreground overflow-hidden">
      <div className="container-custom flex items-center justify-center py-2.5 text-xs sm:text-sm tracking-wide">
        <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
          {[...messages, ...messages].map((msg, i) => {
            const Icon = msg.icon
            return (
              <span key={i} className="inline-flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.75} />
                <span>{msg.text}</span>
              </span>
            )
          })}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
