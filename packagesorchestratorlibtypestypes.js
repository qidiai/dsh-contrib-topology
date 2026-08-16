/**
 * Shared contract between the orchestrator Host gateway and the Web client.
 *
 * Ported control-flow shape from the ai-bridge MultiAgentDispatcher: five
 * dispatch modes (parallel / sequential / select / cascade / merge) plus
 * per-agent retry. The execution seam is `ctx.subagents.start()` — qidi's
 * AgentHub/MergeEngine are replaced by the harness's native delegation.
 */
export {};
//# sourceMappingURL=types.js.map