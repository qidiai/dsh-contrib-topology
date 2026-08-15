/**
 * In-memory ring buffer for observed events.
 *
 * Deliberately queryable (by kind / agent / since) rather than a bare array:
 * the P2 router reads training windows through the same accessors, so the
 * store API is part of the suite's long-lived contract, not an internal
 * detail. M1 keeps everything in memory; M4 adds optional persistence for
 * cross-session training data.
 */

import type { ObserveEvent, ObserveSnapshot, ObserveStats } from '../types.ts'

export interface ObserveQuery {
  readonly kind?: ObserveEvent['kind']
  readonly agent?: string
  /** ISO timestamp lower bound (inclusive). */
  readonly since?: string
  readonly limit?: number
}

export class ObserveStore {
  private events: ObserveEvent[] = []
  private dropped = 0
  private seq = 0
  private maxEvents: number

  constructor(maxEvents = 2_000) {
    this.maxEvents = maxEvents
  }

  /** Allocate a stable, monotonically increasing event id. */
  nextId(): string {
    this.seq += 1
    return `obs-${this.seq}`
  }

  /** M4: retune the ring-buffer capacity live (via the settings seam). */
  setMaxEvents(value: number): void {
    const next = Number.isFinite(value) && value > 0 ? Math.floor(value) : this.maxEvents
    if (next === this.maxEvents) return
    this.maxEvents = next
    while (this.events.length > this.maxEvents) {
      this.events.shift()
      this.dropped += 1
    }
  }

  push(event: ObserveEvent): void {
    if (this.events.length >= this.maxEvents) {
      this.events.shift()
      this.dropped += 1
    }
    this.events.push(event)
  }

  /** Newest-first window for the UI timeline and future router queries. */
  query(filter: ObserveQuery = {}): ObserveEvent[] {
    let out = this.events
    if (filter.kind) out = out.filter((e) => e.kind === filter.kind)
    if (filter.agent) out = out.filter((e) => e.agent === filter.agent)
    if (filter.since) out = out.filter((e) => e.startedAt >= filter.since!)
    out = [...out].reverse()
    return filter.limit ? out.slice(0, filter.limit) : out
  }

  stats(): ObserveStats {
    let toolCalls = 0
    let llmStreams = 0
    let errorCount = 0
    const toolByName = new Map<string, { calls: number; errors: number; durations: number[] }>()
    const modelByName = new Map<string, { streams: number; totalChunks: number; durations: number[] }>()
    for (const e of this.events) {
      if (e.kind === 'tool.call') {
        toolCalls += 1
        const bucket = toolByName.get(e.name) ?? { calls: 0, errors: 0, durations: [] }
        bucket.calls += 1
        if (e.outcome !== 'success') bucket.errors += 1
        if (e.durationMs !== undefined) bucket.durations.push(e.durationMs)
        toolByName.set(e.name, bucket)
      } else if (e.kind === 'llm.stream') {
        llmStreams += 1
        const bucket = modelByName.get(e.name) ?? { streams: 0, totalChunks: 0, durations: [] }
        bucket.streams += 1
        if (typeof e.features?.chunks === 'number') bucket.totalChunks += e.features.chunks
        if (e.durationMs !== undefined) bucket.durations.push(e.durationMs)
        modelByName.set(e.name, bucket)
      }
      if (e.outcome !== 'success') errorCount += 1
    }
    const avg = (durations: number[]): number =>
      durations.length === 0 ? 0 : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const topTools: ObserveStats['topTools'] = [...toolByName.entries()]
      .map(([name, b]) => ({ name, calls: b.calls, errors: b.errors, errorRate: b.calls === 0 ? 0 : b.errors / b.calls }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 8)
    const topModels: ObserveStats['topModels'] = [...modelByName.entries()]
      .map(([name, b]) => ({ name, streams: b.streams, avgDurationMs: avg(b.durations), totalChunks: b.totalChunks }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 8)
    return {
      totalEvents: this.events.length,
      toolCalls,
      llmStreams,
      errorCount,
      droppedCount: this.dropped,
      errorRate: this.events.length === 0 ? 0 : errorCount / this.events.length,
      topTools,
      topModels,
    }
  }

  snapshot(): ObserveSnapshot {
    return {
      events: this.query({ limit: 200 }),
      stats: this.stats(),
      capturedAt: new Date().toISOString(),
    }
  }

  clear(): void {
    this.events = []
    this.dropped = 0
  }
}
