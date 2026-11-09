// Store-owned: hands this store's settings to @amboras-dev/storefront-core.
//
// Next inlines process.env.NEXT_PUBLIC_* only in app source, which is why this
// file lives in the store and not in the package. Every core shim imports it,
// so the config is set in every module graph (pages, route handlers, client).
import { configureCore } from '@amboras-dev/storefront-core/config'

configureCore({
  medusaUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  storeId: process.env.NEXT_PUBLIC_STORE_ID,
  analyticsEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  analyticsIngestUrl: process.env.NEXT_PUBLIC_ANALYTICS_INGEST_URL,
  analyticsKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
})

export {}
