#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import { discoverPages, HELPER_ROUTES, ROOT_DIR } from './lib/routes.mjs'

const REQUIRED_META_FIELDS = [
  'meta.title',
  'meta.description',
  'meta.canonical',
  'meta.og.title',
  'meta.og.description',
  'meta.og.type',
  'meta.og.url',
]

function getByPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj)
}

function isExternalOrIgnored(ref) {
  if (!ref) return true
  const value = ref.trim()
  if (!value) return true
  if (value.startsWith('#')) return true
  if (value.startsWith('mailto:')) return true
  if (value.startsWith('tel:')) return true
  if (value.startsWith('javascript:')) return true
  if (value.startsWith('data:')) return true
  if (/^https?:\/\//i.test(value)) return true
  if (value.startsWith('//')) return true
  return false
}

function stripHashAndQuery(ref) {
  return ref.split('#')[0].split('?')[0]
}

function extractRefs(source) {
  const refs = []
  const attrRegex = /(href|src|srcset)\s*=\s*(["'])(.*?)\2/gi
  let match
  while ((match = attrRegex.exec(source)) !== null) {
    const attr = match[1].toLowerCase()
    const raw = match[3]

    if (attr === 'srcset') {
      const parts = raw
        .split(',')
        .map((item) => item.trim().split(/\s+/)[0])
        .filter(Boolean)
      for (const item of parts) refs.push({ attr, ref: item })
      continue
    }

    refs.push({ attr, ref: raw })
  }
  return refs
}

function toRel(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join('/')
}

function normalizeRouteForJoin(route) {
  if (route.endsWith('/')) return route
  const indexSuffix = '/index.html'
  if (route.endsWith(indexSuffix)) return route.slice(0, -'index.html'.length)
  return `${route}/`
}

function resolveRelativeRef(baseRoute, ref) {
  const base = normalizeRouteForJoin(baseRoute)
  const joined = path.posix.normalize(path.posix.join(base, ref))
  return joined.startsWith('/') ? joined : `/${joined}`
}

async function fileExists(absPath) {
  try {
    await access(absPath, fsConstants.F_OK)
    return true
  } catch {
    return false
  }
}

async function validateAbsoluteRef(target, knownRoutes) {
  const clean = stripHashAndQuery(target)
  if (!clean) return true

  if (clean.endsWith('/')) {
    if (knownRoutes.has(clean)) return true
    const indexCandidate = path.join(ROOT_DIR, clean, 'index.html')
    return fileExists(indexCandidate)
  }

  const hasExt = Boolean(path.extname(clean))
  const abs = path.join(ROOT_DIR, clean)

  if (hasExt) return fileExists(abs)

  if (knownRoutes.has(`${clean}/`)) return true

  const candidates = [abs, `${abs}.html`, path.join(abs, 'index.html')]

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await fileExists(candidate)) return true
  }

  return false
}

function validateCanonical(meta, pageId, errors) {
  const canonical = meta?.meta?.canonical
  const ogUrl = meta?.meta?.og?.url

  try {
    const parsed = new URL(canonical)
    if (parsed.hostname !== 'daviddangerfield.com') {
      errors.push(
        `${pageId}: canonical host must be daviddangerfield.com (found ${parsed.hostname})`,
      )
    }
  } catch {
    errors.push(`${pageId}: canonical is not a valid absolute URL`)
  }

  if (canonical !== ogUrl) {
    errors.push(`${pageId}: meta.canonical and meta.og.url must match exactly`)
  }
}

async function main() {
  const errors = []
  const site = JSON.parse(await readFile(path.join(ROOT_DIR, 'src', 'site.json'), 'utf8'))

  if (!/^G-[A-Z0-9]{6,}$/.test(String(site.gaId || ''))) {
    errors.push('src/site.json: gaId must match pattern G-XXXXXXXX')
  }

  const pages = await discoverPages(ROOT_DIR)
  const knownRoutes = new Set([...HELPER_ROUTES])
  const canonicalUrls = new Set()
  const outputPaths = new Set()

  for (const page of pages) {
    knownRoutes.add(page.route)

    try {
      await access(page.metaPath, fsConstants.F_OK)
      await access(page.contentPath, fsConstants.F_OK)
    } catch {
      errors.push(`${page.pageId}: missing required meta.json or content.html`)
    }

    for (const field of REQUIRED_META_FIELDS) {
      const value = getByPath(page.meta, field)
      if (!value || typeof value !== 'string') {
        errors.push(`${page.pageId}: missing required field ${field}`)
      }
    }

    if (!page.meta.outputPath || typeof page.meta.outputPath !== 'string') {
      errors.push(`${page.pageId}: outputPath must be a non-empty string`)
    }

    if (outputPaths.has(page.meta.outputPath)) {
      errors.push(`${page.pageId}: duplicate outputPath ${page.meta.outputPath}`)
    }
    outputPaths.add(page.meta.outputPath)

    const canonical = page.meta?.meta?.canonical
    if (canonicalUrls.has(canonical)) {
      errors.push(`${page.pageId}: duplicate canonical URL ${canonical}`)
    }
    canonicalUrls.add(canonical)

    validateCanonical(page.meta, page.pageId, errors)
  }

  const refTargets = []

  for (const page of pages) {
    const source = await readFile(page.contentPath, 'utf8')
    const refs = extractRefs(source)

    for (const item of refs) {
      if (isExternalOrIgnored(item.ref)) continue
      refTargets.push({
        sourcePath: toRel(page.contentPath),
        baseRoute: page.route,
        ref: item.ref,
      })
    }
  }

  const partialFiles = ['layout.html', 'header.html', 'footer.html']
  for (const file of partialFiles) {
    const sourcePath = path.join(ROOT_DIR, 'src', 'partials', file)
    const source = await readFile(sourcePath, 'utf8')
    const refs = extractRefs(source)

    for (const item of refs) {
      if (isExternalOrIgnored(item.ref)) continue
      refTargets.push({
        sourcePath: toRel(sourcePath),
        baseRoute: '/',
        ref: item.ref,
      })
    }
  }

  for (const item of refTargets) {
    const cleanRef = stripHashAndQuery(item.ref)
    if (!cleanRef) continue

    let absoluteRef
    if (cleanRef.startsWith('/')) {
      absoluteRef = cleanRef
    } else {
      absoluteRef = resolveRelativeRef(item.baseRoute, cleanRef)
    }

    // eslint-disable-next-line no-await-in-loop
    const valid = await validateAbsoluteRef(absoluteRef, knownRoutes)
    if (!valid) {
      errors.push(`${item.sourcePath}: unresolved reference ${item.ref}`)
    }
  }

  if (errors.length > 0) {
    console.error('Source validation failed:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log(`Source validation passed for ${pages.length} pages.`)
  console.log(`Discovered routes: ${[...knownRoutes].sort().join(', ')}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
