/**
 * pre-publish integrity gate for @qidiai/dsh-contrib-topology.
 *
 * Runs before `npm publish`: verifies every entry in the `files` allowlist,
 * every `exports` target, and the `main`/`types` points actually exist on
 * disk, so an empty or half-built package can never reach the registry.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

/** Recursively list every file under `dir`, with paths relative to `root`. */
function listFiles(dir, prefix = '') {
  const out = []
  for (const name of readdirSync(dir)) {
    const rel = prefix ? `${prefix}/${name}` : name
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listFiles(full, rel))
    else out.push(rel)
  }
  return out
}

/**
 * Match one `files` pattern against the on-disk file list. Only the two shapes
 * used by this package are supported: exact paths and directory glob patterns
 * of the form dir/globstar/ext (both parts split on the slash-star separator).
 */
function patternMatches(pattern, diskFiles) {
  if (!pattern.includes('**')) return diskFiles.includes(pattern)
  const head = pattern.slice(0, pattern.indexOf('/**/'))
  const tail = pattern.slice(pattern.indexOf('/**/') + 4)
  const prefix = head ? `${head}/` : ''
  const suffix = tail.slice(1)
  return diskFiles.some((f) => f.startsWith(prefix) && f.endsWith(suffix))
}

let failures = 0
const check = (cond, label) => {
  if (cond) console.log(`  ok ${label}`)
  else {
    console.error(`  FAIL ${label}`)
    failures += 1
  }
}

console.log(`pre-publish gate: ${pkg.name}@${pkg.version}`)

const disk = listFiles(root)

check(pkg.name === '@qidiai/dsh-contrib-observe', 'package name is the publish scope')
check(typeof pkg.main === 'string' && existsSync(join(root, pkg.main)), `main exists (${pkg.main})`)
check(typeof pkg.types === 'string' && existsSync(join(root, pkg.types)), `types exists (${pkg.types})`)
for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
  const targetString = typeof target === 'string' ? target : target?.default
  if (typeof targetString !== 'string') continue
  if (targetString.includes('*')) {
    // Wildcard subpath export (./src/*): the base directory must exist.
    const dir = targetString.slice(0, targetString.indexOf('*'))
    check(existsSync(join(root, dir)) || dir === '', `exports["${subpath}"] base dir exists (${dir})`)
    continue
  }
  check(existsSync(join(root, targetString)), `exports["${subpath}"] exists (${targetString})`)
}
for (const pattern of pkg.files ?? []) {
  check(patternMatches(pattern, disk), `files entry matches disk (${pattern})`)
}

if (failures > 0) {
  console.error(`\npre-publish gate FAILED: ${failures} problem(s). Refusing to publish.`)
  process.exit(1)
}
console.log('\npre-publish gate PASSED - package is publishable.')
