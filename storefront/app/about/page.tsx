import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Coffee, Leaf, Award, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Aureum Coffee Co. — small-batch, single-origin specialty coffee sourced from family farms and roasted to order.',
}

const FARM_IMAGE = 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1600&q=80'
const ROAST_IMAGE = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1400&q=80'

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={FARM_IMAGE}
            alt="Coffee farm landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container-custom py-24 lg:py-36 text-background text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Our Story</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight max-w-3xl mx-auto text-balance">
            Coffee with a conscience, roasted with obsession.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-background/80 max-w-2xl mx-auto">
            We started Aureum because we were tired of stale, mass-produced coffee masquerading as &ldquo;premium.&rdquo;
            Good coffee shouldn&apos;t be complicated — it should just be fresh, ethically sourced, and brewed to taste like somewhere.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-b border-foreground/10">
        <div className="container-custom grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '100%', label: 'Fair-trade sourcing' },
            { value: '48h', label: 'Max from roast to ship' },
            { value: '3', label: 'Partner farms worldwide' },
            { value: '2,400+', label: 'Happy customers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-heading text-4xl lg:text-5xl font-medium tracking-tight text-accent">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TWO-COLUMN STORY */}
      <section className="py-20 lg:py-28">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
            <Image src={ROAST_IMAGE} alt="Fresh roasted beans" fill className="object-cover" />
          </div>
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">The Craft</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-balance">
              We roast weekly. You drink <em className="italic">weekly-fresh</em>.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Most &ldquo;premium&rdquo; coffee has been sitting on a shelf for months. Ours hasn&apos;t. Every bag is roasted to order
              in small batches, then rushed into your hands within 48 hours — at peak flavor, still releasing CO₂, still carrying
              the character of where it grew.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We work directly with three family-run farms in Ethiopia and Colombia — visiting at harvest, cupping each lot, and
              paying 30–40% above Fair Trade minimums. It&apos;s more expensive. It&apos;s also the only way to get coffee this good.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES GRID */}
      <section className="py-20 bg-muted/40 border-y border-foreground/10">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">What We Stand For</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
              Four things, non-negotiable.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Coffee,
                title: 'Freshness First',
                body: 'Roasted the week it ships. Never sitting on a shelf.',
              },
              {
                icon: Leaf,
                title: 'Organic & Ethical',
                body: 'Pesticide-free, direct-trade, above Fair Trade pricing.',
              },
              {
                icon: Award,
                title: 'Specialty Grade',
                body: 'Only beans scoring 85+ on the SCA scale make the cut.',
              },
              {
                icon: Users,
                title: 'Farmer Partnership',
                body: 'Long-term relationships, fair prices, real impact.',
              },
            ].map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.title}
                  className="bg-background border border-foreground/10 rounded-sm p-6"
                >
                  <div className="h-10 w-10 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-lg font-medium mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24">
        <div className="container-custom text-center max-w-xl">
          <h2 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight mb-5">
            Ready for your first cup?
          </h2>
          <p className="text-muted-foreground mb-8">
            Every bag backed by our 100% Happiness Guarantee. Love it, or we&apos;ll refund you.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:bg-accent transition-colors rounded-full"
          >
            Shop Our Roasts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
