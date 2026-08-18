import { createServer } from 'node:http'
import { access, readFile, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import { dirname, extname, join, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(SCRIPTS_DIR, '..')
const PORT = Number(process.env.PORT || 8000)

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
])

let buildQueued = false
let buildRunning = false
let rebuildTimer

function isInsideRoot(pathname) {
  const relativePath = relative(ROOT_DIR, pathname)
  return relativePath === '' || (!relativePath.startsWith('..') && !relativePath.startsWith('/'))
}

async function fileExists(pathname) {
  try {
    await access(pathname)
    return true
  } catch {
    return false
  }
}

async function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${PORT}`)
  const decodedPath = decodeURIComponent(url.pathname)
  const requestedPath = normalize(join(ROOT_DIR, decodedPath))

  if (!isInsideRoot(requestedPath)) return null

  const requestedStat = await stat(requestedPath).catch(() => null)

  if (requestedStat?.isDirectory()) {
    return join(requestedPath, 'index.html')
  }

  if (requestedStat?.isFile()) {
    return requestedPath
  }

  const indexPath = join(requestedPath, 'index.html')
  if (await fileExists(indexPath)) return indexPath

  return null
}

function runBuild(reason = 'initial') {
  if (buildRunning) {
    buildQueued = true
    return
  }

  buildRunning = true
  console.log(`\n[dev] Build started (${reason})`)

  const build = spawn('npm', ['run', 'build'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })

  build.on('exit', (code) => {
    buildRunning = false
    console.log(code === 0 ? '[dev] Build finished' : `[dev] Build failed with exit code ${code}`)

    if (buildQueued) {
      buildQueued = false
      runBuild('queued change')
    }
  })
}

function queueBuild(filename) {
  clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => runBuild(filename || 'file change'), 150)
}

function startWatcher() {
  watch(join(ROOT_DIR, 'src'), { recursive: true }, (_eventType, filename) => {
    queueBuild(filename)
  })
}

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const filePath = await resolveRequestPath(req.url || '/')

      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('Not found')
        return
      }

      const content = await readFile(filePath)
      res.writeHead(200, {
        'content-type': contentTypes.get(extname(filePath)) || 'application/octet-stream',
      })
      res.end(content)
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(`Internal server error\n${err.message}`)
    }
  })

  server.listen(PORT, () => {
    console.log(`[dev] Serving http://localhost:${PORT}`)
    console.log('[dev] Watching src/ and rebuilding generated pages on changes')
  })
}

runBuild()
startWatcher()
startServer()
