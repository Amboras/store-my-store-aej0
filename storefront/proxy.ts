// Package file: the edge logic is @amboras-dev/storefront-core/edge.
//
// Next reads `config` statically from this file, so the matcher cannot be
// re-exported from the package: it is a literal copy of core's proxyConfig
// Keep it identical to proxyConfig when bumping core.
export { proxy } from '@amboras-dev/storefront-core/edge'

export const config = {
  matcher: [
    // Match every path except framework internals, the public API surface,
    // and obvious static assets — but DO include the JS chunk + CSS asset
    // paths so middleware can rewrite them to the variant deploy on AB
    // stores (post-2026-05-30 middleware-proxy architecture). Fonts /
    // images / media are still excluded to keep middleware invocation
    // volume bounded (review item perf-2: ~30 chunks/css per page load is
    // OK; ~hundreds of font/image requests is not).
    // Webpack layout.
    '/_next/static/chunks/:path*',
    '/_next/static/css/:path*',
    // TURBOPACK layout. Turbopack emits every JS chunk AND every CSS file under
    // /_next/static/immutable/chunks/, which none of the patterns above match
    // — and the catch-all below explicitly excludes _next/. So on a Turbopack
    // build the asset branch NEVER ran: the HTML came from the assigned variant
    // deploy while its chunks fell through to the control deploy, whose content
    // hashes differ. Every asset 404'd and the storefront rendered as unstyled
    // text — the exact cross-deploy chunk skew the branch below exists to stop.
    //
    // Invisible to every check we had: HTTP 200 on the HTML, assets fine on the
    // variant's own *.vercel.app (one deploy serves both there, so nothing can
    // skew), and fine for anyone whose browser had the files cached. It only
    // broke first-time visitors on the custom domain, and only while an A/B
    // campaign was assigning them a variant. (deepresetlabs.com, 2026-09-03.)
    '/_next/static/immutable/:path*',
    //
    // robots.txt, sitemap.xml and the generated child sitemaps (/sitemaps/sitemap/<id>.xml) are crawler
    // files, never A/B-tested: a variant deploy renders no sitemap children, so routing one there would 404
    // the child. The child pattern is anchored (digits, `.xml`, end) so only those files skip the router.
    // This is an A/B-routing exclusion, not an access control.
    '/((?!_next/|api/|favicon\\.ico|robots\\.txt|sitemap\\.xml|sitemaps/sitemap/\\d+\\.xml$).*)',
  ],
}
