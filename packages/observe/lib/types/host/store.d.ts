/**
 * In-memory ring buffer for observed events.
 *
 * Deliberately queryable (by kind / agent / since) rather than a bare array:
 * the P2 router reads training windows through the same accessors, so the
 * store API is part of the suite's long-lived contract, not an internal
 * detail. M1 keeps everything in memory; M4 adds optional persistence for
 * cross-session training data.
 */
import type { ObserveEvent, ObserveSnapshot, ObserveStats } from '../types.ts';
export interface ObserveQuery {
    readonly kind?: ObserveEvent['kind'];
    readonly agent?: string;
    /** ISO timestamp lower bound (inclusive). */
    readonly since?: string;
    readonly limit?: number;
}
export declare class ObserveStore {
    private events;
    private dropped;
    private seq;
    private maxEvents;
    constructor(maxEvents?: number);
    /** Allocate a stable, monotonically increasing event id. */
    nextId(): string;
    /** M4: retune the ring-buffer capacity live (via the settings seam). */
    setMaxEvents(value: number): void;
    push(event: ObserveEvent): void;
    /** Newest-first window for the UI timeline and future router queries. */
    query(filter?: ObserveQuery): ObserveEvent[];
    stats(): ObserveStats;
    snapshot(): ObserveSnapshot;
    clear(): void;
}
//# sourceMappingURL=store.d.ts.map