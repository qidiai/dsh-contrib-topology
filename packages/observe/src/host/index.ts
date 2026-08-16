/**
 * Host-side observe gateway.
 *
 * Registers two strictly non-invasive listeners and projects what they see
 * into a queryable event window:
 *
 *   - `tools/execute` (waterfall): wraps `next()` to time the dispatch and
 *     classify the normalized result. The signal and the result object pass
 *     through untouched — the only sanctioned around-dispatch use.
 *   - `llm/stream` (waterfall): wraps the AsyncIterable to count chunks and
 *     time the stream. Chunks are yielded verbatim; loop-built requests are
 *     deep-frozen and only ever read (dsh's own constraint).
 *
 * All recording is failure-contained: an observing bug must never break the
 * business call it watches.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { ToolDispatchExecution, ToolExecutionResult } from '@deepseek-ai/dsh-tools'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import type { SubagentRunEndInfo, SubagentRunInfo } from '@deepseek-ai/dsh-subagent'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import Schema from '@deepseek-ai/schemastery'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type { ObserveConfig, ObserveOutcome, ObserveSnapshot, ObserveStats } from '../types.ts'
import { ObserveStore } from './store.ts'

export type * from '../types.ts'

/** The `ai-bridge-observe` user-settings namespace (M4 hot-reload seam). */
const NS = settingsNamespace('ai-bridge-observe')

/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG: ObserveConfig = { maxEvents: 2_000, captureTools: true, captureLlm: true }

/** Resolved-value schema for the observe settings section. */
const Config: Schema<ObserveConfig> = Schema.object({
  maxEvents: Schema.number().min(1).default(2_000),
  captureTools: Schema.boolean().default(true),
  captureLlm: Schema.boolean().default(true),
})

/** Best-effort caller-agent key extraction (Agent shape is scope-defined). */
function agentKeyOf(agent: unknown): string | undefined {
  if (agent == null) return undefined
  if (typeof agent === 'string') return agent.length > 0 ? agent : undefined
  if (typeof agent === 'object') {
    const record = agent as Record<string, unknown>
    for (const key of ['key', 'id', 'name'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value.length > 0) return value
    }
  }
  return undefined
}

/** Classify a normalized tool result without depending on its exact variant. */
function outcomeOfResult(result: unknown): ObserveOutcome {
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    if (record.ok === false) return 'error'
    if (typeof record.kind === 'string' && /fail|error/i.test(record.kind)) return 'error'
    if ('error' in record && record.error != null) return 'error'
  }
  return 'success'
}

/**
 * Remote-exposed observability gateway; the class itself is the plugin.
 *
 * Intentionally injects NO service: the gateway only subscribes to the
 * `tools/execute` and `llm/stream` waterfalls via `ctx.on(...)`, which does
 * not require the `tools`/`llm` services to be injected (and would otherwise
 * park this plugin in `pending` on host profiles where those agent-plane
 * services are not yet active — which would block `remote.observe` from
 * registering and break every client that injects it).
 */
export class ObserveGateway extends TypertRemoteService {
  private readonly store = new ObserveStore()
  private config: ObserveConfig = DEFAULT_CONFIG
  /** Delegation start timestamps, keyed by subagent run id (paired start/end). */
  private readonly runStarts = new Map<string, number>()

  constructor(ctx: Context) {
    super(ctx, 'observe')
    ctx.on('tools/execute', this.onToolExecute)
    ctx.on('llm/stream', this.onLlmStream)
    ctx.on('subagent/start', this.onSubagentStart)
    ctx.on('subagent/end', this.onSubagentEnd)
    // M4: the `ai-bridge-observe` user-settings section hot-reloads capacity
    // and the capture switches (the same seam the P2 router will reuse).
    installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
      setSource: (source) => {
        this.config = source()
        this.applyConfig()
      },
      onChange: () => {
        this.applyConfig()
      },
    })
  }

  /** Apply the currently resolved config to the store and capture switches. */
  private applyConfig(): void {
    this.store.setMaxEvents(this.config.maxEvents)
  }

  /** Record the start timestamp for a delegation, keyed by run id. */
  private readonly onSubagentStart = (info: SubagentRunInfo): void => {
    this.runStarts.set(info.runId, Date.now())
  }

  /** Append the delegation outcome to the event timeline (P2 dispatch kind). */
  private readonly onSubagentEnd = (info: SubagentRunEndInfo): void => {
    const startedAt = this.runStarts.get(info.runId)
    this.runStarts.delete(info.runId)
    if (!this.config.captureTools && !this.config.captureLlm) return
    try {
      const outcome: ObserveOutcome = info.stopReason === 'completed' ? 'success' : 'error'
      this.store.push({
        id: this.store.nextId(),
        kind: 'subagent.dispatch',
        name: info.provider,
        ...(agentKeyOf(info.id) ? { agent: agentKeyOf(info.id)! } : {}),
        startedAt: new Date(startedAt ?? Date.now()).toISOString(),
        ...(startedAt === undefined ? {} : { durationMs: Date.now() - startedAt }),
        outcome,
        source: 'builtin',
        features: { local: info.local, stopReason: info.stopReason },
      })
    } catch {
      // contained by design
    }
  }

  /** Around-dispatch timing. Never touches exec.signal or the result. */
  private readonly onToolExecute = async (
    exec: ToolDispatchExecution,
    next: () => Promise<ToolExecutionResult>,
  ): Promise<ToolExecutionResult> => {
    const startedAt = Date.now()
    try {
      const result = await next()
      if (this.config.captureTools) this.recordTool(exec, startedAt, outcomeOfResult(result))
      return result
    } catch (error) {
      if (this.config.captureTools) this.recordTool(exec, startedAt, 'error')
      throw error
    }
  }

  /** Stream wrapping. Chunks pass through verbatim; only counted. */
  private readonly onLlmStream = (
    options: GenerateOptions,
    next: () => AsyncIterable<StreamChunk>,
  ): AsyncIterable<StreamChunk> => {
    const startedAt = Date.now()
    let inner: AsyncIterable<StreamChunk>
    try {
      inner = next()
    } catch (error) {
      if (this.config.captureLlm) this.recordLlm(options, startedAt, 0, 'error')
      throw error
    }
    return this.wrapLlmStream(options, startedAt, inner)
  }

  private async *wrapLlmStream(
    options: GenerateOptions,
    startedAt: number,
    inner: AsyncIterable<StreamChunk>,
  ): AsyncIterable<StreamChunk> {
    let chunks = 0
    try {
      for await (const chunk of inner) {
        chunks += 1
        yield chunk
      }
      if (this.config.captureLlm) this.recordLlm(options, startedAt, chunks, 'success')
    } catch (error) {
      if (this.config.captureLlm) this.recordLlm(options, startedAt, chunks, 'error')
      throw error
    }
  }

  /** Failure-contained event recording: observation must never break calls. */
  private recordTool(exec: ToolDispatchExecution, startedAt: number, outcome: ObserveOutcome): void {
    try {
      const name = typeof exec.name === 'string' && exec.name.length > 0 ? exec.name : 'unknown'
      this.store.push({
        id: this.store.nextId(),
        kind: 'tool.call',
        name,
        ...(agentKeyOf(exec.agent) ? { agent: agentKeyOf(exec.agent)! } : {}),
        startedAt: new Date(startedAt).toISOString(),
        durationMs: Date.now() - startedAt,
        outcome,
        source: name.startsWith('mcp__') ? 'mcp' : 'builtin',
      })
    } catch {
      // contained by design
    }
  }

  private recordLlm(
    options: GenerateOptions,
    startedAt: number,
    chunks: number,
    outcome: ObserveOutcome,
  ): void {
    try {
      const provider = typeof options.provider === 'string' ? options.provider : 'unknown'
      const model = typeof options.model === 'string' ? options.model : 'unknown'
      this.store.push({
        id: this.store.nextId(),
        kind: 'llm.stream',
        name: `${provider}/${model}`,
        startedAt: new Date(startedAt).toISOString(),
        durationMs: Date.now() - startedAt,
        outcome,
        source: 'builtin',
        features: { chunks },
      })
    } catch {
      // contained by design
    }
  }

  /** Newest-first observation window plus aggregate counters. */
  @Remote('snapshot')
  snapshot(): ObserveSnapshot {
    return this.store.snapshot()
  }

  /** Aggregate counters only (cheap polling variant). */
  @Remote('stats')
  stats(): ObserveStats {
    return this.store.stats()
  }

  /** Reset the ring buffer (debug / session-boundary use). */
  @Remote('clear')
  clear(): void {
    this.store.clear()
  }
}

export default ObserveGateway
