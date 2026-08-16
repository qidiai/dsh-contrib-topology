/**
 * MCP bridge settings tab — multi-server orchestration view.
 *
 * Lists every bridge-managed MCP server (status + tool count), and lets you
 * add/remove servers at runtime. The host diff-drives mcp-client instances
 * from the `ai-bridge-mcp` settings namespace; this tab is the visible face.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { BridgeServerState, BridgeSnapshot, McpServerConfig } from '../types.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './BridgeTab.module.css'

export interface BridgeTabInjected {
  /** Fetch the current bridge snapshot (server states). */
  snapshot(): Promise<BridgeSnapshot>
  /** Add one server at runtime. */
  addServer(server: McpServerConfig): Promise<BridgeSnapshot>
  /** Remove one server at runtime. */
  removeServer(serverName: string): Promise<BridgeSnapshot>
}

/** Full component props assembled by the Settings slot renderer. */
export type BridgeTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginMcpBridge'>
  & InjectFace<BridgeTabInjected>

const STATUS_KEYS = {
  connected: 'status.connected',
  reconnecting: 'status.reconnecting',
  failed: 'status.failed',
  stopped: 'status.stopped',
} as const

/** Render the live MCP server list plus the add/remove controls. */
export function BridgeTab({ snapshot, addServer, removeServer, t }: BridgeTabProps): ReactNode {
  const [data, setData] = useState<BridgeSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [transport, setTransport] = useState<'stdio' | 'streamable-http'>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setData(await snapshot())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [snapshot])

  useEffect(() => { void refresh() }, [refresh])

  const runAdd = useCallback(async () => {
    if (!name.trim() || busy) return
    const invalid = transport === 'stdio' ? !command.trim() : !url.trim()
    if (invalid) {
      setError(t('err.invalid'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const server: McpServerConfig = {
        serverName: name.trim(),
        transport,
        ...(transport === 'stdio'
          ? { command: command.trim(), ...(args.trim() ? { args: args.split(',').map((s) => s.trim()).filter(Boolean) } : {}) }
          : { url: url.trim() }),
      }
      await addServer(server)
      setName('')
      setCommand('')
      setArgs('')
      setUrl('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [name, transport, command, args, url, busy, addServer, refresh, t])

  const runRemove = useCallback(async (serverName: string) => {
    try {
      await removeServer(serverName)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [removeServer, refresh])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }

  const servers: readonly BridgeServerState[] = data?.servers ?? []

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.servers')}: {servers.length}</span>
        <button className={styles.refresh} type="button" onClick={() => void refresh()}>{t('refresh')}</button>
      </div>

      <div className={styles.addBox}>
        <input className={styles.input} placeholder={t('field.serverName')} value={name} onChange={(e) => setName(e.target.value)} />
        <select
          className={styles.select}
          value={transport}
          onChange={(e) => setTransport(e.target.value as 'stdio' | 'streamable-http')}
        >
          <option value="stdio">stdio</option>
          <option value="streamable-http">streamable-http</option>
        </select>
        {transport === 'stdio' ? (
          <>
            <input className={styles.input} placeholder={t('field.command')} value={command} onChange={(e) => setCommand(e.target.value)} />
            <input className={styles.input} placeholder={t('field.args')} value={args} onChange={(e) => setArgs(e.target.value)} />
          </>
        ) : (
          <input className={styles.input} placeholder={t('field.url')} value={url} onChange={(e) => setUrl(e.target.value)} />
        )}
        <button className={styles.addBtn} type="button" onClick={() => void runAdd()} disabled={busy || !name.trim()}>
          {busy ? '…' : t('btn.add')}
        </button>
      </div>

      <div className={styles.list}>
        {servers.length === 0 && <div className={styles.empty}>{t('empty')}</div>}
        {servers.map((server) => (
          <div key={server.serverName} className={styles.row}>
            <span className={styles.name}>{server.serverName}</span>
            <span className={`${styles.status} ${styles[server.status] ?? ''}`}>{t(STATUS_KEYS[server.status])}</span>
            <span className={styles.tools}>{t('tools.count')}: {server.toolCount}</span>
            {server.lastError && <span className={styles.err} title={server.lastError}>{server.lastError}</span>}
            <button className={styles.removeBtn} type="button" onClick={() => void runRemove(server.serverName)}>
              {t('btn.remove')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
