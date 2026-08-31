#!/usr/bin/env node

import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const SCRIPTS_DIR = join(fileURLToPath(new URL('.', import.meta.url)))
const ROOT_DIR = join(SCRIPTS_DIR, '..')
const SOURCE_FILE = join(ROOT_DIR, 'src', 'site.json')
const PDF_PATH = join(ROOT_DIR, 'Resume-David-Dangerfield.pdf')

function formatDateStamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function parseSequence(version) {
  const match = String(version).match(/-(\d+)$/)
  return match ? Number(match[1]) : 0
}

function resolveVersion(requestedVersion, currentVersion) {
  const today = formatDateStamp()
  const currentDate = String(currentVersion || '').split('-')[0]

  if (requestedVersion) {
    const requestedDate = String(requestedVersion).split('-')[0]
    if (requestedVersion === currentVersion) {
      if (requestedDate === today) {
        return `${today}-${parseSequence(currentVersion) + 1}`
      }
      return requestedVersion
    }
    return requestedVersion
  }

  if (currentVersion === today) {
    return `${today}-1`
  }

  if (currentDate === today && String(currentVersion).startsWith(`${today}-`)) {
    return `${today}-${parseSequence(currentVersion) + 1}`
  }

  return today
}

function parseArgs(argv, currentVersion) {
  let version = ''

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === '--version') {
      version = argv[i + 1] || ''
      i += 1
      continue
    }

    if (token === '--help' || token === '-h') {
      console.log(`
Usage: npm run update:resume [--version YYYYMMDD or YYYYMMDD-N]

Replaces the resume version in src/site.json, regenerates the social-share image,
and rebuilds the static HTML with the latest cache-busting resume URL.
If you update the resume more than once on the same day, the script automatically
increments the version suffix so browsers fetch the newest PDF.
`)
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${token}`)
  }

  return resolveVersion(version, currentVersion)
}

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`)
  }
}

async function ensureFileExists(path, label) {
  try {
    await access(path, constants.F_OK)
  } catch {
    throw new Error(`${label} not found: ${path}`)
  }
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE_FILE, 'utf8'))
  const version = parseArgs(process.argv.slice(2), source.resumeVersion)

  await ensureFileExists(PDF_PATH, 'Resume PDF')

  source.resumeVersion = version
  source.resumeUrl = `/Resume-David-Dangerfield.pdf?v=${version}`

  await writeFile(SOURCE_FILE, `${JSON.stringify(source, null, 2)}\n`, 'utf8')
  console.log(`Updated resume version to ${version}`)

  run(
    'node',
    ['scripts/generate-resume-share.mjs', '--input', 'Resume-David-Dangerfield.pdf'],
    'Generate resume share image',
  )
  run('npm', ['run', 'build'], 'Regenerate site HTML')
  run('node', ['scripts/validate-source.mjs'], 'Validate source configuration')

  console.log(`\nResume update complete.`)
  console.log(`Current URL: /Resume-David-Dangerfield.pdf?v=${version}`)
}

main().catch((error) => {
  console.error(`\nResume update failed: ${error.message}`)
  process.exit(1)
})
