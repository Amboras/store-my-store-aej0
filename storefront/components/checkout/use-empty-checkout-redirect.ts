'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'

export const EMPTY_CHECKOUT_REDIRECT = '/cart'

/** Sends a /checkout visit with no cart, or an empty one, to the cart page. Returns true while redirecting. */
export function useEmptyCheckoutRedirect(): boolean {
  const router = useRouter()
  const { cart, isLoading, error } = useCart()
  const hasItems = !!cart?.items?.length
  // Only on arrival: completing an order clears the cart on its way to the success page.
  const [sawItems, setSawItems] = useState(false)
  if (hasItems && !sawItems) setSawItems(true)

  const empty = !isLoading && !error && !hasItems && !sawItems
  useEffect(() => {
    if (empty) router.replace(EMPTY_CHECKOUT_REDIRECT)
  }, [empty, router])
  return empty
}
