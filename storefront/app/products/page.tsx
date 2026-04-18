'use client'

import { useState } from 'react'
import ProductGrid from '@/components/product/product-grid'
import { useQuery } from '@tanstack/react-query'
import { getMedusaClient } from '@/lib/medusa-client'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getMedusaClient().store.category.list({ limit: 100 })
      return response.product_categories
    },
  })

  const allCategories = categories || []

  return (
    <>
      {/* Page Header */}
      <div className="border-b">
        <div className="container-custom py-section-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">The Lineup</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight">Shop all roasts</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Small-batch specialty coffee, roasted to order. Explore our single-origin lineup and signature blends.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-sm bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">Category</h3>
                {loadingCategories ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 w-24 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`block w-full text-left py-1.5 text-sm transition-colors ${
                        !selectedCategory ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All Products
                    </button>
                    {allCategories.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`block w-full text-left py-1.5 text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Filter */}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-full px-3 py-1.5 transition-colors"
                >
                  Clear filters
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            <ProductGrid
              limit={100}
              categoryId={selectedCategory || undefined}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
    </>
  )
}
