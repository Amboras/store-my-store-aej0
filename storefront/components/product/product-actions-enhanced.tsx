'use client'

import { useMemo, useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import {
  Minus,
  Plus,
  Check,
  Loader2,
  Flame,
  Clock,
  Truck,
  Shield,
  RotateCcw,
  Gift,
  Award,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import type { Product } from '@/types'

interface ProductActionsEnhancedProps {
  product: Product
  variantExtensions?: Record<string, VariantExtension>
  enableBundles?: boolean
}

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantWithPrice {
  id: string
  options?: VariantOption[]
  calculated_price?: {
    calculated_amount?: number
    currency_code?: string
  } | number
  [key: string]: unknown
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

type BundleKey = 'single' | 'double' | 'triple'

function getVariantPriceAmount(variant: ProductVariantWithPrice | undefined): number | null {
  const cp = variant?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

function formatPrice(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

// Ships-today countdown — resets at midnight, triggers 5pm cutoff
function useShipsTodayCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const cutoff = new Date()
      cutoff.setHours(17, 0, 0, 0) // 5pm cutoff
      if (now >= cutoff) {
        cutoff.setDate(cutoff.getDate() + 1)
      }
      const diff = cutoff.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

export default function ProductActionsEnhanced({
  product,
  variantExtensions,
  enableBundles = false,
}: ProductActionsEnhancedProps) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const firstVariant = variants[0]
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) {
          defaults[optionId] = opt.value
        }
      }
    }
    return defaults
  })

  const [bundle, setBundle] = useState<BundleKey>(enableBundles ? 'double' : 'single')
  const [justAdded, setJustAdded] = useState(false)
  const { addItem, isAddingItem } = useCart()

  const countdown = useShipsTodayCountdown()

  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v) => {
        if (!v.options) return false
        return v.options.every((opt) => {
          const optionId = opt.option_id || opt.option?.id
          if (!optionId) return false
          return selectedOptions[optionId] === opt.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const ext = selectedVariant?.id ? variantExtensions?.[selectedVariant.id] : null
  const currentPriceCents = getVariantPriceAmount(selectedVariant)
  const cp = selectedVariant?.calculated_price
  const currency = (cp && typeof cp !== 'number' ? cp.currency_code : undefined) || 'usd'

  const allowBackorder = ext?.allow_backorder ?? false
  const inventoryQuantity = ext?.inventory_quantity
  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0
  const isLowStock = inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity < 15

  // Bundle configs — quantity + visual pricing
  const bundleOptions: {
    key: BundleKey
    qty: number
    label: string
    badge?: string
    highlight?: boolean
    savings?: (price: number) => number
  }[] = [
    { key: 'single', qty: 1, label: '1 Bag' },
    {
      key: 'double',
      qty: 2,
      label: '2 Bags',
      badge: 'Most Popular',
      highlight: true,
      savings: () => 0,
    },
    {
      key: 'triple',
      qty: 3,
      label: '3 Bags',
      badge: 'Buy 2, Get 1 Free',
      savings: (price) => price, // one bag free
    },
  ]

  const selectedBundle = bundleOptions.find((b) => b.key === bundle) || bundleOptions[0]
  const quantity = enableBundles ? selectedBundle.qty : 1

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const handleAddToCart = () => {
    if (!selectedVariant?.id || isOutOfStock) return

    addItem(
      { variantId: selectedVariant.id, quantity },
      {
        onSuccess: () => {
          setJustAdded(true)
          if (enableBundles && bundle === 'triple') {
            toast.success('3-bag bundle added — 1 bag free at checkout!')
          } else if (enableBundles && bundle === 'double') {
            toast.success('2-bag bundle added to your bag')
          } else {
            toast.success('Added to bag')
          }
          const metaValue = toMetaCurrencyValue(currentPriceCents)
          trackAddToCart(
            product?.id || '',
            selectedVariant.id,
            quantity,
            currentPriceCents ?? undefined,
          )
          trackMetaEvent('AddToCart', {
            content_ids: [selectedVariant.id],
            content_type: 'product',
            content_name: product?.title,
            value: metaValue,
            currency,
            contents: [{ id: selectedVariant.id, quantity, item_price: metaValue }],
            num_items: quantity,
          })
          setTimeout(() => setJustAdded(false), 2500)
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to add to bag')
        },
      },
    )
  }

  const hasMultipleVariants = variants.length > 1

  return (
    <div className="space-y-7">
      {/* Star rating row */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              className="h-4 w-4 fill-accent text-accent"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.363 1.118l1.287 3.96c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.054 9.387c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
          ))}
        </div>
        <span className="font-medium">4.9</span>
        <span className="text-muted-foreground">· 847 reviews</span>
      </div>

      {/* Price */}
      <ProductPrice
        amount={currentPriceCents}
        currency={currency}
        compareAtPrice={ext?.compare_at_price}
        soldOut={isOutOfStock}
        size="detail"
      />

      {/* Tasting-note pill strip (coffee-specific nice-to-have) */}
      {product.description && (
        <div className="flex flex-wrap gap-2">
          {['Dark chocolate', 'Caramel', 'Stone fruit']
            .filter((_, idx) => product.title.toLowerCase().includes('signature') || idx < 2)
            .slice(0, 3)
            .map((note) => (
              <span
                key={note}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1 border border-foreground/15 rounded-full text-muted-foreground"
              >
                <span className="h-1 w-1 rounded-full bg-accent" />
                {note}
              </span>
            ))}
        </div>
      )}

      {/* Option Selectors */}
      {hasMultipleVariants &&
        options.map((option: ProductOptionWithValues) => {
          const values = (option.values || [])
            .map((v) => (typeof v === 'string' ? v : v.value))
            .filter(Boolean) as string[]

          if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default')) {
            return null
          }

          const optionId = option.id
          const selectedValue = selectedOptions[optionId]

          return (
            <div key={optionId}>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                {option.title}
                {selectedValue && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                    — {selectedValue}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedValue === value
                  const isAvailable = variants.some((v) => {
                    const hasValue = v.options?.some(
                      (o) =>
                        (o.option_id === optionId || o.option?.id === optionId) &&
                        o.value === value,
                    )
                    if (!hasValue) return false
                    const vExt = variantExtensions?.[v.id]
                    if (!vExt) return true
                    if (vExt.allow_backorder) return true
                    return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                  })

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionId, value)}
                      disabled={!isAvailable}
                      className={`min-w-[56px] px-4 py-2.5 text-sm rounded-sm border transition-all ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : isAvailable
                            ? 'border-foreground/20 hover:border-foreground'
                            : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* ===== BUNDLE OFFER ===== */}
      {enableBundles && currentPriceCents != null && (
        <div className="pt-2">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 flex items-center gap-2">
            <Gift className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
            Choose Your Bundle
          </h3>
          <div className="space-y-2.5">
            {bundleOptions.map((opt) => {
              const isSelected = bundle === opt.key
              const totalCents = currentPriceCents * opt.qty
              const discountCents = opt.savings?.(currentPriceCents) ?? 0
              const finalCents = totalCents - discountCents
              const perBagCents = finalCents / opt.qty

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setBundle(opt.key)}
                  className={`relative w-full text-left border rounded-sm px-4 py-3.5 transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-foreground/15 hover:border-foreground/40'
                  }`}
                >
                  {opt.badge && (
                    <span
                      className={`absolute -top-2.5 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        opt.key === 'triple'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-foreground text-background'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* radio dot */}
                      <span
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-accent' : 'border-foreground/25'
                        }`}
                      >
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatPrice(perBagCents, currency)} / bag
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatPrice(finalCents, currency)}</p>
                      {discountCents > 0 && (
                        <p className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(totalCents, currency)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== URGENCY ===== */}
      <div className="border border-foreground/10 rounded-sm divide-y divide-foreground/10 bg-muted/30">
        {/* Ships today countdown */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-accent" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">
              <span className="font-semibold">Order in </span>
              <span className="font-mono font-semibold tabular-nums text-accent">
                {countdown || '00:00:00'}
              </span>
              <span className="font-semibold"> to ship today</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Roasted fresh &amp; out the door by 5pm</p>
          </div>
        </div>

        {/* Stock status */}
        {isLowStock && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Flame className="h-4 w-4 text-red-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                Only <span className="text-red-600">{inventoryQuantity}</span> bags left in this roast
              </p>
              <div className="mt-1.5 h-1 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${Math.min(100, ((inventoryQuantity ?? 0) / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== ADD TO CART ===== */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAddingItem}
        className={`w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold uppercase tracking-wider transition-all rounded-sm ${
          isOutOfStock
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : justAdded
              ? 'bg-green-700 text-white'
              : 'bg-foreground text-background hover:bg-accent'
        }`}
      >
        {isAddingItem ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" />
            Added to Bag
          </>
        ) : isOutOfStock ? (
          'Sold Out'
        ) : (
          <>
            Add to Bag
            {enableBundles && currentPriceCents != null && (
              <span className="opacity-80">
                ·{' '}
                {formatPrice(
                  currentPriceCents * selectedBundle.qty -
                    (selectedBundle.savings?.(currentPriceCents) ?? 0),
                  currency,
                )}
              </span>
            )}
          </>
        )}
      </button>

      {/* Secure checkout row */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" strokeWidth={2} />
        Secure checkout · 256-bit SSL · We never store card details
      </div>

      {/* ===== TRUST BADGES GRID ===== */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-foreground/10">
        {[
          { icon: Truck, title: 'Free Shipping', sub: 'On orders over $50' },
          { icon: RotateCcw, title: '30-Day Returns', sub: 'Love it or money back' },
          { icon: Award, title: 'Freshness Promise', sub: 'Roasted within 7 days' },
          { icon: Shield, title: 'Secure Checkout', sub: 'SSL encrypted' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex items-start gap-2.5 p-3 border border-foreground/10 rounded-sm"
            >
              <Icon className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Guarantee badge */}
      <div className="flex items-center gap-4 p-4 border border-accent/30 bg-accent/5 rounded-sm">
        <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Award className="h-6 w-6 text-accent" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold">100% Happiness Guarantee</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            If this coffee isn&apos;t your favorite, we&apos;ll refund your order. No questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
