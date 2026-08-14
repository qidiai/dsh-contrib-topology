/**
 * Headless runtime verification for the TopologyGateway host Remote.
 *
 * Goal: prove `graph()` actually projects a live Loader into a correct
 * bipartite plugin/service snapshot — the exact data the SVG tab renders.
 * No browser, no typert host runtime required: we stand up a Cordis Context,
 * provide a mock `loader` service, apply the real TopologyGateway, and call
 * the real `graph()` method.
 *
 * Run: node --import tsx packages/contrib/topology/verify-runtime.ts
 */
import { Context, Service } from '@deepseek-ai/cordis'
import type { FiberState } from '@deepseek-ai/cordis'
import { TopologyGateway } from './src/host/index.ts'
import type { LoaderEntryLike } from './src/host/index.ts'

// --- FiberState mirror (cross-package const enum, must match Cordis) ---
const S = { PENDING: 0, LOADING: 1, ACTIVE: 2, FAILED: 3, DISPOSED: 4, UNLOADING: 5 } as const satisfies Record<keyof typeof S, FiberState>

interface LoaderEntry extends LoaderEntryLike {}

// Plugin A — active, injects two services
const fiberA = { state: S.ACTIVE as FiberState, inject: { tools: {}, llm: {} } }
// Plugin B — pending, injects one service, nested under A (parent chain)
const fiberB = { state: S.PENDING as FiberState, inject: { tools: {} }, parent: { fiber: fiberA } }

const mockEntries: LoaderEntry[] = [
  { id: 'plugin:a', options: { name: 'Plugin A' }, fiber: fiberA },
  { id: 'plugin:b', options: { name: 'Plugin B' }, fiber: fiberB },
  // group entry must be skipped
  { id: 'group:g', options: { name: 'Group G', group: true }, fiber: undefined as never },
  // disabled plugin with no fiber — enabled:false, phase null, no injects
  { id: 'plugin:c', disabled: true, options: { name: 'Plugin C' }, fiber: undefined as never },
]

class MockLoader extends Service {
  constructor(ctx: Context) {
    super(ctx, 'loader')
  }
  entries(): Iterable<LoaderEntry> {
    return mockEntries
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('  ✗ FAIL:', msg)
    process.exitCode = 1
    throw new Error(msg)
  }
  console.log('  ✓', msg)
}

const ctx = new Context()
// Instantiate services directly (synchronous registration onto ctx), bypassing
// Cordis plugin-scheduling timing. `graph()` reads ctx.loader directly, and the
// TopologyGateway Service constructor registers ctx.topology.
new MockLoader(ctx)
const gw = new TopologyGateway(ctx)
const snap = gw.graph()

console.log('\n[capturedAt]', snap.capturedAt)

console.log('\n[nodes]')
const pluginNodes = snap.nodes.filter((n) => n.kind === 'plugin').map((n) => n.plugin!)
const serviceNodes = snap.nodes.filter((n) => n.kind === 'service').map((n) => n.service!)
assert(pluginNodes.length === 3, `3 plugin nodes (group skipped), got ${pluginNodes.length}`)
assert(serviceNodes.length === 2, `2 service hubs (tools, llm), got ${serviceNodes.length}`)

const a = pluginNodes.find((p) => p.id === 'plugin:a')!
const b = pluginNodes.find((p) => p.id === 'plugin:b')!
const c = pluginNodes.find((p) => p.id === 'plugin:c')!
assert(a.fiberPhase === 'active', `plugin:a phase active, got ${a.fiberPhase}`)
assert(a.injects.join(',') === 'tools,llm', `plugin:a injects tools,llm, got ${a.injects}`)
assert(b.fiberPhase === 'pending', `plugin:b phase pending, got ${b.fiberPhase}`)
assert(b.parentId === 'plugin:a', `plugin:b parentId=plugin:a, got ${b.parentId}`)
assert(c.enabled === false, `plugin:c enabled=false, got ${c.enabled}`)
assert(c.fiberPhase === null, `plugin:c phase null, got ${c.fiberPhase}`)
assert(c.injects.length === 0, `plugin:c no injects, got ${c.injects.length}`)

console.log('\n[edges]')
const contains = snap.edges.filter((e) => e.kind === 'contains')
const injects = snap.edges.filter((e) => e.kind === 'injects')
assert(contains.length === 1 && contains[0].from === 'plugin:a' && contains[0].to === 'plugin:b',
  'one contains edge a→b')
assert(injects.length === 3, `3 injects edges (a→tools, a→llm, b→tools), got ${injects.length}`)

const toolsSvc = serviceNodes.find((s) => s.id === 'service:tools')!
const llmSvc = serviceNodes.find((s) => s.id === 'service:llm')!
assert(toolsSvc.consumerCount === 2, `service:tools consumerCount=2, got ${toolsSvc.consumerCount}`)
assert(llmSvc.consumerCount === 1, `service:llm consumerCount=1, got ${llmSvc.consumerCount}`)

console.log('\n✅ TopologyGateway.graph() runtime verification PASSED')
