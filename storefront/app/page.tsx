'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  Coffee,
  Leaf,
  Package,
  Award,
  Truck,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80'
const BEANS_IMAGE = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1600&q=80'
const POUR_IMAGE = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&q=80'
const LATTE_IMAGE = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80'
const FARM_IMAGE = 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1400&q=80'
const SHOP_IMAGE = 'https://images.unsplash.com/photo-1559525839-d9acfd02054c?w=1200&q=80'

function formatPrice(amount?: number | null, currency = 'usd') {
  if (amount == null) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

export default function HomePage() {
  const { data: productsData, isLoading } = useProducts({ limit: 6 })
  const products = (productsData || []) as Array<{
    id: string
    handle: string
    title: string
    subtitle?: string | null
    thumbnail?: string | null
    variants?: Array<{
      calculated_price?: {
        calculated_amount?: number
        original_amount?: number
        currency_code?: string
      }
    }>
  }>
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', { content_name: 'newsletter_signup', status: 'submitted' })
    setSubscribed(true)
    setNewsletterEmail('')
  }

  return (
    <>
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-muted/40">
        <div className="container-custom grid lg:grid-cols-12 gap-8 lg:gap-12 items-center py-16 lg:py-28">
          {/* Text */}
          <div className="lg:col-span-6 space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/15 bg-background/60 backdrop-blur text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={2} />
              Fresh roast · Shipped in 48h
            </div>

            <h1 className="font-heading text-[3rem] leading-[1.05] sm:text-[3.75rem] lg:text-[5rem] font-medium tracking-tight text-balance">
              Coffee worth <em className="italic text-accent">slowing down</em> for.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Small-batch, single-origin beans sourced directly from family farms in Ethiopia and Colombia.
              Roasted to order, never sitting on a shelf.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-sm font-medium uppercase tracking-wide hover:opacity-90 transition-opacity rounded-full"
                prefetch={true}
              >
                Shop the Roast
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-foreground/25 px-7 py-3.5 text-sm font-medium uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors rounded-full"
                prefetch={true}
              >
                Our Story
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
                <span className="font-medium text-foreground">4.9/5</span>
                from 2,400+ cups poured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5" strokeWidth={1.75} />
                Organic &amp; Fair Trade
              </span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-6 relative animate-fade-in">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              <Image
                src={HERO_IMAGE}
                alt="Freshly brewed specialty coffee"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="hidden sm:flex absolute -left-4 lg:-left-8 bottom-10 bg-background border border-foreground/10 rounded-sm shadow-lg px-5 py-4 items-center gap-3 max-w-[240px]">
              <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Coffee className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-semibold">Roasted this week</p>
                <p className="text-[11px] text-muted-foreground">from 3 family farms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VALUE PROPOSITION STRIP ========== */}
      <section className="border-y border-foreground/10 bg-background">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 divide-x divide-foreground/10">
          {[
            { icon: Coffee, title: 'Roasted to Order', sub: 'Never stale, always fresh' },
            { icon: Leaf, title: 'Ethically Sourced', sub: 'Direct trade farms' },
            { icon: Package, title: 'Free US Shipping', sub: 'On orders over $50' },
            { icon: Award, title: '100% Guarantee', sub: "Love it or we'll refund" },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-6 sm:px-6">
                <Icon className="h-5 w-5 flex-shrink-0 text-accent" strokeWidth={1.5} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10 lg:mb-14 gap-6 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">The Lineup</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                Shop our roasts
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide link-underline pb-0.5"
              prefetch={true}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] bg-muted rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {products.slice(0, 3).map((product) => {
                const price = product.variants?.[0]?.calculated_price?.calculated_amount
                const currency = product.variants?.[0]?.calculated_price?.currency_code || 'usd'
                const compareAt = product.variants?.[0]?.calculated_price?.original_amount
                const onSale =
                  compareAt != null && price != null && compareAt > price
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    className="group block"
                    prefetch={true}
                  >
                    <div className="relative aspect-[4/5] bg-muted rounded-sm overflow-hidden mb-4">
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {onSale && (
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          Save {Math.round(((compareAt - price) / compareAt) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-lg font-medium group-hover:text-accent transition-colors">
                          {product.title}
                        </h3>
                        {product.subtitle && (
                          <p className="text-xs text-muted-foreground mt-1">{product.subtitle}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold">{formatPrice(price, currency)}</p>
                        {onSale && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(compareAt, currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide link-underline pb-0.5"
              prefetch={true}
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== EDITORIAL — FROM BEAN TO CUP ========== */}
      <section className="py-20 lg:py-28 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              <Image
                src={FARM_IMAGE}
                alt="Coffee farm at origin"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 lg:max-w-md">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Our Philosophy</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-balance">
                From the farm to your <em className="italic">french press</em>.
              </h2>
              <p className="text-base text-background/80 leading-relaxed">
                We work directly with family-run farms at origin — paying well above Fair Trade minimums — to source
                coffees that taste like the land they came from. Each lot is cupped, scored, and roasted in small
                batches the week it ships.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  'Direct-trade relationships with 3 partner farms',
                  'Specialty-grade only (85+ SCA score)',
                  'Roasted in small batches, shipped within 48 hours',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-2 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-background/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide mt-2 border-b border-background/40 hover:border-background pb-1 transition-colors"
                prefetch={true}
              >
                Read our story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BREW METHODS / HOW TO ENJOY ========== */}
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center mb-14 max-w-xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Brew Guide</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
              However you brew it.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose your grind at checkout — pre-ground for your exact method, or whole bean to grind fresh at home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { img: POUR_IMAGE, title: 'Pour Over', note: 'Bright · Clean · Nuanced' },
              { img: BEANS_IMAGE, title: 'French Press', note: 'Full Body · Rich · Bold' },
              { img: LATTE_IMAGE, title: 'Espresso', note: 'Intense · Syrupy · Sweet' },
            ].map((method) => (
              <div key={method.title} className="group">
                <div className="relative aspect-[4/5] rounded-sm overflow-hidden mb-5">
                  <Image
                    src={method.img}
                    alt={method.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-background">
                    <p className="font-heading text-2xl font-medium">{method.title}</p>
                    <p className="text-xs uppercase tracking-widest opacity-80 mt-1">{method.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== REVIEWS / SOCIAL PROOF ========== */}
      <section className="py-20 lg:py-24 bg-muted/40 border-y border-foreground/10">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9/5</span> average from 2,400+ customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: "Finally, a coffee that lives up to its description. The Signature Blend has become my daily ritual.",
                author: 'Maya K.',
                location: 'Portland, OR',
              },
              {
                quote: "You can taste the difference fresh roasting makes. Bright, clean, and nothing like supermarket coffee.",
                author: 'James L.',
                location: 'Brooklyn, NY',
              },
              {
                quote: "The Yirgacheffe is a revelation — jasmine and lemon zest, just like they promised. Worth every penny.",
                author: 'Sofia R.',
                location: 'Austin, TX',
              },
            ].map((review, i) => (
              <figure key={i} className="bg-background border border-foreground/10 rounded-sm p-6 lg:p-8">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="font-heading text-lg leading-snug italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs">
                  <span className="font-semibold">{review.author}</span>
                  <span className="text-muted-foreground"> · {review.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section className="py-20 lg:py-24">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-sm bg-foreground text-background">
            <div className="absolute inset-0 opacity-30">
              <Image src={SHOP_IMAGE} alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-foreground/70" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-8 p-8 sm:p-12 lg:p-16 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Join the Club</p>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                  15% off your first order.
                </h2>
                <p className="mt-4 text-background/80 max-w-sm">
                  Subscribe for brew guides, new-origin drops, and members-only discounts. No spam — just good coffee.
                </p>
              </div>
              <div>
                {subscribed ? (
                  <div className="flex items-center gap-3 bg-background/10 border border-background/20 rounded-sm p-5">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-accent" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold">You&apos;re in.</p>
                      <p className="text-sm text-background/80">Check your inbox for your welcome code.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-background/10 border border-background/20 rounded-sm px-4 py-3.5 text-sm text-background placeholder:text-background/50 focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-accent text-accent-foreground px-6 py-3.5 text-sm font-medium uppercase tracking-wide hover:opacity-90 transition-opacity rounded-sm whitespace-nowrap"
                    >
                      Get 15% Off
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST BAR ========== */}
      <section className="border-t border-foreground/10 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <Truck className="h-5 w-5 text-accent flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Shield className="h-5 w-5 text-accent flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Freshness Guarantee</p>
                <p className="text-xs text-muted-foreground">Love it or money back</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center sm:justify-end">
              <Leaf className="h-5 w-5 text-accent flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Ethically Sourced</p>
                <p className="text-xs text-muted-foreground">Direct-trade farms</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
