import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// amboras:image-hosts-reader:begin v1 (managed by Amboras, identical in every store: do not edit. To allow another image host, ask the Amboras AI or support.)
//
// The hosts the /_next/image optimizer may fetch are DATA owned by the Amboras
// platform, not code: adding a host never needs a change to this file. They are
// resolved once when this config loads, from the first source that answers:
//   1. the platform: GET <platform>/api/v1/public/storefront/image-hosts?store=<NEXT_PUBLIC_STORE_ID>
//      (the platform's hosts plus this store's own; 2s timeout). <platform> is
//      AMBORAS_PLATFORM_API_URL, else derived from the Medusa host
//      (api[-env].amboras.com -> core[-env].amboras.com), else core.amboras.com;
//   2. AMBORAS_IMAGE_HOSTS: a JSON array or a comma list of exact host names;
//   3. AMBORAS_FALLBACK_IMAGE_HOSTS below.
// The exact host of NEXT_PUBLIC_MEDUSA_BACKEND_URL is always added.
// EXACT host names only: a response or env value holding a wildcard host, an IP
// or anything else that is not a plain DNS name is refused whole, so the
// optimizer can never turn back into an open image proxy. Never throws: a build
// with no network uses the fallback list.
const AMBORAS_FALLBACK_IMAGE_HOSTS = [
  { protocol: 'https', hostname: 'api.amboras.com' },
  { protocol: 'https', hostname: 'ahjviugsxpwzpkyzgrhi.supabase.co', pathname: '/storage/v1/object/public/**' },
  { protocol: 'https', hostname: 'fdkykcojwvimoabfaqjc.supabase.co', pathname: '/storage/v1/object/public/**' },
  { protocol: 'https', hostname: 'cdn.shopify.com' },
  { protocol: 'https', hostname: 'pixabay.com' },
  { protocol: 'https', hostname: 'cdn.pixabay.com' },
  { protocol: 'https', hostname: 'unsplash.com' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'plus.unsplash.com' },
  { protocol: 'https', hostname: 'pexels.com' },
  { protocol: 'https', hostname: 'images.pexels.com' },
  { protocol: 'https', hostname: 'upload.wikimedia.org' },
  { protocol: 'https', hostname: 'commons.wikimedia.org' },
]

async function resolveAmborasImageHosts() {
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'])
  const DNS_NAME = /^(?=.{4,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/
  const isExactHost = (host) =>
    typeof host === 'string' && DNS_NAME.test(host) && !/^[\d.]+$/.test(host) && !LOCAL_HOSTS.has(host)
  const PATHNAME = /^\/[A-Za-z0-9._~\/-]*$/

  // One remote pattern, or null when it is not an exact host (with an optional
  // port and a path, which may end in a single trailing /** glob).
  const toPattern = (entry) => {
    if (!entry || typeof entry !== 'object') return null
    const { protocol, hostname, port, pathname } = entry
    if (protocol !== 'https' && protocol !== 'http') return null
    if (!isExactHost(hostname)) return null
    if (port !== undefined && !(typeof port === 'string' && /^\d{1,5}$/.test(port))) return null
    if (pathname !== undefined && !(typeof pathname === 'string' && PATHNAME.test(pathname.replace(/\/\*\*$/, '/')))) {
      return null
    }
    return { protocol, hostname, ...(port ? { port } : {}), ...(pathname ? { pathname } : {}) }
  }

  // The exact host (and port) of the Medusa backend this build talks to. Unset,
  // unparsable, non-http(s) and local URLs are skipped: the local entries are
  // listed separately and must never be reachable from a deployed store.
  function envImageRemotePatterns() {
    const raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim()
    if (!raw) return []
    let url
    try {
      url = new URL(raw)
    } catch {
      return []
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return []
    const hostname = url.hostname.toLowerCase()
    if (!hostname || LOCAL_HOSTS.has(hostname) || hostname.includes('*')) return []
    return [
      {
        protocol: url.protocol === 'http:' ? 'http' : 'https',
        hostname,
        ...(url.port ? { port: url.port } : {}),
      },
    ]
  }

  function platformApiUrl() {
    const explicit = process.env.AMBORAS_PLATFORM_API_URL?.trim()
    if (explicit) return explicit
    try {
      const medusa = new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || '').hostname.toLowerCase()
      const env = medusa.match(/^api(-[a-z0-9]+)?\.amboras\.com$/)
      if (env) return 'https://core' + (env[1] ?? '') + '.amboras.com'
    } catch {}
    return 'https://core.amboras.com'
  }

  // GET JSON with a hard 2s budget. node:http(s) rather than fetch: on a
  // timeout the socket is destroyed, so an unreachable platform never keeps
  // the process alive after the config has loaded.
  async function getJson(url) {
    const { request } = await import(url.protocol === 'http:' ? 'node:http' : 'node:https')
    return new Promise((resolve) => {
      const req = request(url, { agent: false, headers: { accept: 'application/json' } }, (res) => {
        if (res.statusCode !== 200) {
          req.destroy()
          return resolve(null)
        }
        let text = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          text += chunk
          if (text.length > 256 * 1024) req.destroy()
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(text))
          } catch {
            resolve(null)
          }
        })
      })
      const timer = setTimeout(() => req.destroy(), 2000)
      req.on('error', () => resolve(null))
      req.on('close', () => {
        clearTimeout(timer)
        resolve(null)
      })
      req.end()
    })
  }

  async function fromPlatform() {
    try {
      const url = new URL('/api/v1/public/storefront/image-hosts', platformApiUrl())
      const store = process.env.NEXT_PUBLIC_STORE_ID?.trim()
      if (store) url.searchParams.set('store', store)
      const body = await getJson(url)
      if (!body || !Array.isArray(body.hosts) || body.hosts.length === 0 || body.hosts.length > 500) return null
      const patterns = body.hosts.map(toPattern)
      return patterns.every(Boolean) ? { patterns, from: url.origin } : null
    } catch {
      return null
    }
  }

  function fromEnv() {
    const raw = process.env.AMBORAS_IMAGE_HOSTS?.trim()
    if (!raw) return null
    let list
    try {
      list = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',')
    } catch {
      return null
    }
    if (!Array.isArray(list) || list.length === 0) return null
    const patterns = list.map((host) =>
      typeof host === 'string' ? toPattern({ protocol: 'https', hostname: host.trim().toLowerCase() }) : null,
    )
    return patterns.every(Boolean) ? patterns : null
  }

  // next build loads this config more than once (main thread, then build
  // workers that inherit the env): resolve and log once, then reuse the result
  // so every load of one build sees the same list.
  const RESOLVED = '__AMBORAS_IMAGE_HOSTS_RESOLVED'
  try {
    const cached = JSON.parse(process.env[RESOLVED] || 'null')
    const patterns = Array.isArray(cached) && cached.length > 0 ? cached.map(toPattern) : null
    if (patterns && patterns.every(Boolean)) return patterns
  } catch {}

  let source = 'fallback list'
  let hosts = AMBORAS_FALLBACK_IMAGE_HOSTS
  const platform = await fromPlatform()
  const env = platform ? null : fromEnv()
  if (platform) {
    source = 'platform ' + platform.from
    hosts = platform.patterns
  } else if (env) {
    source = 'AMBORAS_IMAGE_HOSTS'
    hosts = env
  }
  const medusa = envImageRemotePatterns()
  console.log(
    '[amboras] image hosts: ' + hosts.length + ' from ' + source + ', ' + medusa.length + ' from NEXT_PUBLIC_MEDUSA_BACKEND_URL',
  )
  const all = [...hosts, ...medusa]
  process.env[RESOLVED] = JSON.stringify(all)
  return all
}

const amborasImageHosts = await resolveAmborasImageHosts()
// amboras:image-hosts-reader:end

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  allowedDevOrigins: ['*.tunnel.amboras.com'],
  outputFileTracingRoot: __dirname,
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
    NEXT_PUBLIC_ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...amborasImageHosts,
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      '@medusajs/js-sdk',
      'sonner',
    ],
  },
  // Faster incremental builds
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // Optimize webpack in dev (fallback when not using Turbopack)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

export default nextConfig
