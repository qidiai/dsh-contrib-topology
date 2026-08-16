/**
 * Orchestration engine — pure control-flow, no I/O.
 *
 * Ported from the ai-bridge MultiAgentDispatcher: five dispatch modes
 * (parallel / sequential / select / cascade / merge) plus per-agent retry.
 * Execution is injected as a callback so the host can bind it to
 * `ctx.subagents.start()` (the harness's native delegation seam).
 */

import type { OrchestratorMode, OrchestratorRequest, OrchestratorResult, OrchestratorRun } from './types.ts'

/** Delegate one task to one provider. Returns the run outcome. */
export type RunExecutor = (agent: string, task: string) => Promise<Omit<OrchestratorRun, 'agent'>>

export interface EngineOptions {
  readonly parallelLimit: number
  readonly retryCount: number
}

const DEFAULT_LIMIT = 3
const DEFAULT_RETRY = 0

/**
 * Permanent failures that retrying cannot fix — skip retries for these error
 * classes (they would only repeat the same outcome and burn latency).
 */
const PERMANENT_ERROR_MARKERS = [
  'parent agent unavailable',
  'no subagent provider registered',
  'skipped after select winner',
  'subagents service unavailable',
] as const

function isRetryable(error: string | undefined): boolean {
  if (error === undefined || error.length === 0) return true
  return !PERMANENT_ERROR_MARKERS.some((marker) => error.includes(marker))
}

/** Run one agent with retries; permanent errors are not retried. */
async function runWithRetry(
  agent: string,
  task: string,
  run: RunExecutor,
  retryCount: number,
): Promise<OrchestratorRun> {
  let last: Omit<OrchestratorRun, 'agent'> = { ok: false, durationMs: 0, error: 'no attempt' }
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    last = await run(agent, task)
    if (last.ok) break
    if (!isRetryable(last.error)) break
  }
  return { agent, ...last }
}

/** Run every agent with a dynamic concurrency window (shrink on failures). */
async function runAll(
  agents: readonly string[],
  task: string,
  run: RunExecutor,
  options: EngineOptions,
): Promise<OrchestratorRun[]> {
  const runs: OrchestratorRun[] = []
  // Dynamic limit: start at the configured parallelLimit; a batch with >=50%
  // failures halves the window (back-pressure), a fully successful batch
  // recovers one step toward the limit.
  let currentLimit = Math.max(1, options.parallelLimit)
  for (let i = 0; i < agents.length; i += currentLimit) {
    const batch = agents.slice(i, i + currentLimit)
    const settled = await Promise.all(batch.map((agent) => runWithRetry(agent, task, run, options.retryCount)))
    runs.push(...settled)
    const failures = settled.filter((r) => !r.ok).length
    if (failures > 0 && failures / settled.length >= 0.5) {
      currentLimit = Math.max(1, Math.floor(currentLimit / 2))
    } else if (failures === 0) {
      currentLimit = Math.min(options.parallelLimit, currentLimit + 1)
    }
  }
  return runs
}

/**
 * Execute a dispatch. Mode semantics:
 * - parallel: all candidates concurrently (bounded), winner = best ok run.
 * - sequential: one after another until success; winner = first ok agent.
 * - select: pick the first candidate only (router seam is applied by the host
 *   before calling — the host reorders `agents` via the router rank Remote).
 * - cascade: try candidates in order until one succeeds.
 * - merge: all candidates concurrently, winner = best ok run, all outputs kept.
 */
export async function orchestrate(
  request: OrchestratorRequest,
  run: RunExecutor,
  options: EngineOptions = { parallelLimit: DEFAULT_LIMIT, retryCount: DEFAULT_RETRY },
): Promise<OrchestratorResult> {
  const mode: OrchestratorMode = request.mode ?? 'parallel'
  const agents = request.agents && request.agents.length > 0 ? [...request.agents] : []
  const startedAt = new Date().toISOString()
  const startedMs = Date.now()

  let runs: OrchestratorRun[] = []
  let winner: string | undefined
  let mergedSummary: string | undefined

  if (agents.length === 0) {
    runs = []
  } else if (mode === 'parallel') {
    runs = await runAll(agents, request.task, run, options)
    winner = runs.find((r) => r.ok)?.agent
  } else if (mode === 'merge') {
    // merge: run all concurrently, keep every successful output, and aggregate
    // them into a structured `merged` summary (agent-tagged, newline-separated).
    runs = await runAll(agents, request.task, run, options)
    winner = runs.find((r) => r.ok)?.agent
    const merged = runs
      .filter((r) => r.ok && r.output !== undefined && r.output.length > 0)
      .map((r) => `[${r.agent}] ${r.output}`)
      .join('\n')
    if (merged.length > 0) {
      mergedSummary = merged
    }
  } else if (mode === 'sequential' || mode === 'cascade') {
    const accumulated: OrchestratorRun[] = []
    for (const agent of agents) {
      const attempt = await runWithRetry(agent, request.task, run, options.retryCount)
      accumulated.push(attempt)
      if (attempt.ok) {
        winner = agent
        break
      }
    }
    runs = accumulated
  } else if (mode === 'select') {
    const [first, ...rest] = agents
    const attempt = await runWithRetry(first!, request.task, run, options.retryCount)
    runs = [attempt, ...(attempt.ok ? [] : rest.map((agent) => ({ agent, ok: false, durationMs: 0, error: 'skipped after select winner' })))]
    winner = attempt.ok ? first : undefined
  }

  return {
    task: request.task,
    mode,
    runs,
    ...(winner === undefined ? {} : { winner }),
    ...(mergedSummary === undefined ? {} : { merged: mergedSummary }),
    allOk: runs.length > 0 && runs.every((r) => r.ok),
    startedAt,
    durationMs: Date.now() - startedMs,
  }
}
