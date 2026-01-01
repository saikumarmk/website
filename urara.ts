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

const rmFile = (src: string, { dest = path.join(check(path.parse(src).ext.slice(1)), src.slice(6)) } = {}) => {
  // Don't delete files in protected directories
  const protectedDirs = ['src/routes/growth', 'src/routes/monash-graph']
  
  if (protectedDirs.some(dir => dest.startsWith(dir))) {
    log('cyan', 'skip protected file', dest)
    return Promise.resolve()
  }
  
  return fs
    .rm(dest)
    .then(() => log('yellow', 'remove file', dest))
    .catch(error)
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
  dest.forEach(path =>
    fs
      .mkdir(path)
      .then(() => log('green', 'make dir', path))
      .catch(error)
  )
}

const rmDir = (src: string, { dest = [path.join('src/routes', src.slice(6)), path.join('static', src.slice(6))] } = {}) => {
  // Don't delete directories with custom TypeScript/Svelte code
  const protectedDirs = ['src/routes/growth', 'src/routes/monash-graph']
  
  dest.forEach(targetPath => {
    // Skip if this is a protected directory
    if (protectedDirs.some(dir => targetPath.startsWith(dir))) {
      log('cyan', 'skip protected dir', targetPath)
      return
    }
    
    fs
      .rm(targetPath, { force: true, recursive: true })
      .then(() => log('yellow', 'remove dir', targetPath))
      .catch(error)
  })
}

const cleanDir = (src: string) =>
  fs.readdir(src, { withFileTypes: true }).then(files => {
    files.forEach(file => {
      const dest = path.join(src, file.name)
      file.isDirectory() ? rmDir(dest) : file.name.startsWith('.') ? log('cyan', 'ignore file', dest) : rmFile(dest)
    })
  })

const build = () => {
  mkDir('static', { dest: ['static'] })
  cpDir('urara')
}

const clean = () => {
  cleanDir('urara')
  rmDir('static', { dest: ['static'] })
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
        .on('unlink', file => rmFile(file))
        .on('addDir', dir => mkDir(dir))
        .on('unlinkDir', dir => rmDir(dir))
        .on('error', error => log('red', 'error', error))
        .on('ready', () => log('cyan', 'copy complete. ready for changes'))
    process
      .on('SIGINT', () => {
        log('red', 'sigint')
        // Don't clean on dev server stop - preserve custom src/routes files
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
    clean()
    break
  default:
    log('red', 'error', 'invalid arguments')
    break
}
