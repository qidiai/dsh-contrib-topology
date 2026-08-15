/**
 * Shared contract between the router Host gateway and the Web client.
 *
 * The router scores subagent providers from observed run history (the same
 * signal source as observe, but focused on delegation outcomes) using the
 * 7-dimension Bayesian routing core in `routing.ts`. `rank()` returns an
 * explainable ordering — components + reason per provider — so the model or
 * an orchestrator can delegate to the best candidate with visible rationale.
 */
export {};
//# sourceMappingURL=types.js.map