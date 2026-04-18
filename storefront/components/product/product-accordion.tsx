'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ProductAccordionProps {
  description?: string | null
  details?: Record<string, string>
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[40rem] pb-5' : 'max-h-0'
        }`}
      >
        <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductAccordion({ description }: ProductAccordionProps) {
  return (
    <div className="border-t">
      {description && (
        <AccordionItem title="Description" defaultOpen>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </AccordionItem>
      )}

      <AccordionItem title="Brewing Guide">
        <ul className="space-y-2">
          <li><strong>Pour-over:</strong> 1:16 ratio · 205°F water · 3-minute brew</li>
          <li><strong>French press:</strong> 1:15 ratio · Coarse grind · 4-minute steep</li>
          <li><strong>Espresso:</strong> 18g in / 36g out · 25–30 seconds</li>
          <li><strong>Cold brew:</strong> 1:8 ratio · Coarse grind · 16 hours in the fridge</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Freshness & Storage">
        <ul className="space-y-2">
          <li>Every bag is roasted within 7 days of shipping</li>
          <li>Store in an airtight container, away from heat and light</li>
          <li>Best enjoyed within 4 weeks of the roast date on the bag</li>
          <li>Do <strong>not</strong> refrigerate or freeze — it introduces moisture</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="Shipping & Returns">
        <ul className="space-y-2">
          <li>Free standard shipping on orders over $50 (US)</li>
          <li>Orders placed before 5pm ET ship the same day</li>
          <li>Express &amp; international shipping available at checkout</li>
          <li>100% Happiness Guarantee — if you don&apos;t love it, we&apos;ll refund you</li>
        </ul>
      </AccordionItem>
    </div>
  )
}
