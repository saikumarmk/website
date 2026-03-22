/**
 * Urara.TS
 * Version: Any
 */

import { promises as fs } from 'fs'
import * as path from 'path'
import chokidar from 'chokidar'
import chalk from 'chalk'

const config = {
  extensions: ['md'],
  catch: ['ENOENT', 'EEXIST']
}

const check = (ext: string) => (config.extensions.includes(ext) ? 'src/routes' : 'static')

const log = (color: string, msg: string, dest?: string | Error) =>
  console.log(
    chalk.dim(new Date().toLocaleTimeString() + ' ') +
      chalk.magentaBright.bold('[urara] ') +
      chalk[color](msg + ' ') +
      chalk.dim(dest ?? '')
  )

const error = (err: { code: string; message: unknown }) => {
  if (config.catch.includes(err.code)) {
    console.log(
      chalk.dim(new Date().toLocaleTimeString() + ' ') +
        chalk.redBright.bold('[urara] ') +
        chalk.red('error ') +
        chalk.dim(err.message)
    )
  } else {
    throw err
  }
}

const cpFile = (src: string, { stat = 'copy', dest = path.join(check(path.parse(src).ext.slice(1)), src.slice(6)) } = {}) =>
  fs
    .copyFile(src, dest)
    .then(() => log('green', `${stat} file`, dest))
    .catch(error)

/** Remove a single mirrored file (same mapping as cpFile). */
const rmFile = async (
  src: string,
  { dest = path.join(check(path.parse(src).ext.slice(1)), src.slice(6)) } = {}
) => {
  try {
    await fs.rm(dest)
    log('yellow', 'remove file', dest)
  } catch (err) {
    error(err as { code: string; message: unknown })
  }
}

const cpDir = (src: string) =>
  fs.readdir(src, { withFileTypes: true }).then(files =>
    files.forEach(file => {
      const dest = path.join(src, file.name)
      if (file.isDirectory()) {
        mkDir(dest)
        cpDir(dest)
      } else if (file.name.startsWith('.')) {
        log('cyan', 'ignore file', dest)
      } else {
        cpFile(dest)
      }
    })
  )

const mkDir = (src: string, { dest = [path.join('src/routes', src.slice(6)), path.join('static', src.slice(6))] } = {}) => {
  dest.forEach(p =>
    fs
      .mkdir(p)
      .then(() => log('green', 'make dir', p))
      .catch(error)
  )
}

/**
 * Walk `urara/` and remove only mirrored *files* (never recursive rm on src/routes).
 * This keeps hand-authored SvelteKit files under the same route tree (e.g. growth/2026/+page.svelte).
 */
const cleanDir = async (src: string): Promise<void> => {
  const files = await fs.readdir(src, { withFileTypes: true })
  for (const file of files) {
    const dest = path.join(src, file.name)
    if (file.isDirectory()) {
      await cleanDir(dest)
    } else if (file.name.startsWith('.')) {
      log('cyan', 'ignore file', dest)
    } else {
      await rmFile(dest)
    }
  }
}

/** Delete only Urara-copied markdown under src/routes mirror (same ext rules as cpFile). */
const removeRoutesMirrorUraraFiles = async (routesDir: string): Promise<void> => {
  const st = await fs.stat(routesDir).catch(() => null)
  if (!st?.isDirectory()) return
  const entries = await fs.readdir(routesDir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(routesDir, e.name)
    if (e.isDirectory()) {
      await removeRoutesMirrorUraraFiles(full)
    } else if (e.name.startsWith('.')) {
      continue
    } else {
      const ext = path.parse(e.name).ext.slice(1).toLowerCase()
      if (config.extensions.includes(ext)) {
        try {
          await fs.rm(full)
          log('yellow', 'remove file', full)
        } catch (err) {
          error(err as { code: string; message: unknown })
        }
      }
    }
  }
}

/** Remove the static subtree that mirrored this urara path (non-.md assets from urara). */
const removeStaticMirrorSubtree = async (staticDir: string): Promise<void> => {
  const st = await fs.stat(staticDir).catch(() => null)
  if (!st) return
  if (st.isFile()) {
    try {
      await fs.rm(staticDir)
      log('yellow', 'remove file', staticDir)
    } catch (err) {
      error(err as { code: string; message: unknown })
    }
    return
  }
  const entries = await fs.readdir(staticDir, { withFileTypes: true })
  for (const e of entries) {
    await removeStaticMirrorSubtree(path.join(staticDir, e.name))
  }
  try {
    await fs.rmdir(staticDir)
  } catch {
    /* not empty or gone */
  }
}

/** Bottom-up remove empty directories (after md/static cleanup). */
const pruneEmptyDirectories = async (dir: string): Promise<void> => {
  const st = await fs.stat(dir).catch(() => null)
  if (!st?.isDirectory()) return
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory()) {
      await pruneEmptyDirectories(path.join(dir, e.name))
    }
  }
  const remaining = await fs.readdir(dir)
  if (remaining.length === 0) {
    try {
      await fs.rmdir(dir)
      log('yellow', 'remove empty dir', dir)
    } catch {
      /* ignore */
    }
  }
}

/**
 * When a directory is removed under urara/, do NOT rm -rf src/routes/... (that deleted Growth app code).
 * Only remove mirrored .md in routes and mirrored assets under static, then prune empty dirs.
 */
const removeMirrorForUnlinkedUraraDir = async (uraraDirPath: string): Promise<void> => {
  const resolved = path.resolve(uraraDirPath)
  const uraraRoot = path.resolve('urara')
  const rel = path.relative(uraraRoot, resolved)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    log('cyan', 'skip unlinkDir (outside urara/)', uraraDirPath)
    return
  }
  const routesMirror = path.join('src/routes', rel)
  const staticMirror = path.join('static', rel)
  await removeRoutesMirrorUraraFiles(routesMirror)
  await removeStaticMirrorSubtree(staticMirror)
  await pruneEmptyDirectories(routesMirror)
}

const build = () => {
  mkDir('static', { dest: ['static'] })
  cpDir('urara')
}

const clean = async () => {
  await cleanDir('urara')
  await fs
    .rm('static', { recursive: true, force: true })
    .then(() => log('yellow', 'remove dir', 'static'))
    .catch(error)
}

switch (process.argv[2]) {
  case 'watch':
    {
      const watcher = chokidar.watch('urara', {
        ignored: (file: string) => path.basename(file).startsWith('.')
      })
      watcher
        .on('add', file => cpFile(file))
        .on('change', file => cpFile(file, { stat: 'update' }))
        .on('unlink', file => void rmFile(file))
        .on('addDir', dir => mkDir(dir))
        .on('unlinkDir', dir => void removeMirrorForUnlinkedUraraDir(dir).catch(error))
        .on('error', error => log('red', 'error', error))
        .on('ready', () => log('cyan', 'copy complete. ready for changes'))
      process
        .on('SIGINT', () => {
          log('red', 'sigint')
          watcher?.close()
        })
        .on('SIGTERM', () => {
          log('red', 'sigterm')
          watcher?.close()
        })
        .on('exit', () => {
          log('red', 'exit')
        })
    }
    break
  case 'build':
    build()
    break
  case 'clean':
    void clean()
      .then(() => process.exit(0))
      .catch(e => {
        console.error(e)
        process.exit(1)
      })
    break
  default:
    log('red', 'error', 'invalid arguments')
    break
}
