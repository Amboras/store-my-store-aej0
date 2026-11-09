// Package file: @amboras-dev/storefront-core renders plugin slots. This store
// only binds its generated registry (core never imports app/_generated).
import '@/lib/amboras'
import { PLUGIN_REGISTRY } from '@/app/_generated/plugin-registry'
import { createPluginSlot } from '@amboras-dev/storefront-core/server/plugin-slot'

export const PluginSlot = createPluginSlot(PLUGIN_REGISTRY)
export default PluginSlot
