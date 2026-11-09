'use client'

import '@/lib/amboras'
import { ThemeProvider } from 'next-themes'
import { CoreProvider } from '@amboras-dev/storefront-core/client'
import { PLUGIN_REGISTRY } from '@/app/_generated/plugin-registry'
import type { PluginConfigs } from '@/types/plugins'

interface ProvidersProps {
  children: React.ReactNode
  pluginConfigs?: PluginConfigs
}

export function Providers({ children, pluginConfigs = {} }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* CoreProvider: the query client, the plugin registry, the payment UI and
          the rootProviders slot. */}
      <CoreProvider registry={PLUGIN_REGISTRY} pluginConfigs={pluginConfigs}>
        {children}
      </CoreProvider>
    </ThemeProvider>
  )
}
