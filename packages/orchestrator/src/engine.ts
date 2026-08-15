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

/** Run one agent with retries; collect the outcome. */
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
  }
  return { agent, ...last }
}

/** Chunk an array into fixed-size batches. */
function chunks<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** Run every agent, bounded concurrency, preserving input order. */
async function runAll(
  agents: readonly string[],
  task: string,
  run: RunExecutor,
  options: EngineOptions,
): Promise<OrchestratorRun[]> {
  const runs: OrchestratorRun[] = []
  for (const batch of chunks(agents, Math.max(1, options.parallelLimit))) {
    const settled = await Promise.all(batch.map((agent) => runWithRetry(agent, task, run, options.retryCount)))
    runs.push(...settled)
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

  if (agents.length === 0) {
    runs = []
  } else if (mode === 'parallel' || mode === 'merge') {
    runs = await runAll(agents, request.task, run, options)
    winner = runs.find((r) => r.ok)?.agent
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
    allOk: runs.length > 0 && runs.every((r) => r.ok),
    startedAt,
    durationMs: Date.now() - startedMs,
  }
}
