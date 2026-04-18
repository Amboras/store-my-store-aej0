import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRight,
  Coffee,
  Leaf,
  Sparkles,
  MapPin,
  Flame,
  Users,
} from 'lucide-react'
import ProductActionsEnhanced from '@/components/product/product-actions-enhanced'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price,*collection',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(
  productId: string,
): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: { url: string }) => img.url !== product.thumbnail),
  ]

  const displayImages =
    allImages.length > 0 ? allImages : [{ url: getProductPlaceholder(product.id) }]

  // Enable bundle offer for any product in "Signature Roasts" collection
  const enableBundles =
    ((product as unknown as { collection?: { handle?: string } }).collection)?.handle ===
    'signature-roasts'

  const firstVariant = product.variants?.[0] as
    | {
        id: string
        calculated_price?: { calculated_amount?: number; currency_code?: string }
      }
    | undefined

  return (
    <>
      {/* Urgency banner */}
      {enableBundles && (
        <div className="bg-accent/10 border-b border-accent/20">
          <div className="container-custom py-2.5">
            <p className="text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent flex-shrink-0" strokeWidth={2} />
              <span className="text-accent font-semibold">Limited roast:</span>
              <span className="text-foreground">Buy 2 bags, get 1 free — auto-applied at checkout</span>
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[50vw]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ========== Product Images ========== */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted rounded-sm">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} view ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== Product Info ========== */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              {product.subtitle ? (
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
                  {product.subtitle}
                </p>
              ) : (
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
                  Small-Batch · Single Origin
                </p>
              )}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-medium tracking-tight leading-[1.1]">
                {product.title}
              </h1>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={firstVariant?.id || null}
              currency={firstVariant?.calculated_price?.currency_code || 'usd'}
              value={firstVariant?.calculated_price?.calculated_amount ?? null}
            />

            <ProductActionsEnhanced
              product={product}
              variantExtensions={variantExtensions}
              enableBundles={enableBundles}
            />

            {/* Accordion Sections */}
            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>

      {/* ========== BELOW THE FOLD — TRUST & STORY ========== */}
      <section className="py-16 lg:py-24 bg-muted/40 border-t border-foreground/10">
        <div className="container-custom">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Why Aureum</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight">
              Coffee, the way it&apos;s meant to be.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MapPin,
                title: 'Direct from Origin',
                body: 'We travel to source from family farms, paying well above Fair Trade minimums.',
              },
              {
                icon: Flame,
                title: 'Roasted to Order',
                body: 'Every bag is roasted within 7 days of shipping. Never stale, always fresh.',
              },
              {
                icon: Leaf,
                title: 'Certified Organic',
                body: 'Pesticide-free, ethically sourced, and certified by independent auditors.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="bg-background border border-foreground/10 rounded-sm p-6 lg:p-8"
                >
                  <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========== REVIEWS ========== */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
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
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">4.9/5</span> from 847 verified customers
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight mt-6">
              What people are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote:
                  "I've tried every 'specialty' roaster on the internet. This is the one I re-order every month. Rich, smooth, and always fresh.",
                author: 'David M.',
                verified: true,
              },
              {
                quote:
                  'The packaging is stunning and the coffee itself? Incredible. You can actually taste the tasting notes, which is rare.',
                author: 'Priya S.',
                verified: true,
              },
              {
                quote:
                  "Switched my entire team to Aureum for our office. Everyone noticed the difference on day one. The bundle deal is unbeatable.",
                author: 'Marcus T.',
                verified: true,
              },
            ].map((r, i) => (
              <figure
                key={i}
                className="bg-background border border-foreground/10 rounded-sm p-6 lg:p-7"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className="h-3.5 w-3.5 fill-accent text-accent"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.165c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.363 1.118l1.287 3.96c.3.922-.755 1.688-1.539 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.96a1 1 0 00-.363-1.118L2.054 9.387c-.783-.57-.38-1.81.588-1.81h4.165a1 1 0 00.95-.69l1.286-3.96z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed mb-5">&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="text-xs flex items-center gap-2">
                  <span className="font-semibold">{r.author}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-700 uppercase tracking-wider font-medium">
                      <Users className="h-2.5 w-2.5" strokeWidth={2} />
                      Verified
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA STRIP ========== */}
      <section className="py-16 bg-foreground text-background">
        <div className="container-custom text-center max-w-2xl">
          <Coffee className="h-8 w-8 mx-auto mb-5 text-accent" strokeWidth={1.5} />
          <h2 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight mb-4">
            Taste the difference fresh makes.
          </h2>
          <p className="text-background/80 mb-8 max-w-md mx-auto">
            Every bag roasted to order and shipped within 48 hours. Your mornings deserve better.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity rounded-full"
          >
            Shop All Roasts
          </Link>
        </div>
      </section>
    </>
  )
}
