/**
 * Generate a social-share image from a resume screenshot or PDF using the v7 style:
 * - abstracted/blurred background (non-legible)
 * - dark top banner
 * - clear CTA text
 *
 * Usage:
 *   node scripts/generate-resume-share.mjs --input Resume-David-Dangerfield.pdf
 *   node scripts/generate-resume-share.mjs --input images/social/resume-share-source.png
 *
 * Optional:
 *   --output images/social/resume-share.png
 *   --title "Download Resume"
 *   --subtitle "Latest PDF"
 *   --font-bold "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
 *   --font-regular "/System/Library/Fonts/Supplemental/Arial.ttf"
 */

import { access, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(SCRIPTS_DIR, '..')
const FAVICON_PATH = 'favicon-48x48.png'

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const args = {
    input: '',
    output: 'images/social/resume-share.png',
    title: 'David Dangerfield Resume',
    fontBold: '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    fontRegular: '/System/Library/Fonts/Supplemental/Arial.ttf',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === '--input') {
      args.input = argv[i + 1] || ''
      i += 1
      continue
    }

    if (token === '--output') {
      args.output = argv[i + 1] || args.output
      i += 1
      continue
    }

    if (token === '--title') {
      args.title = argv[i + 1] || args.title
      i += 1
      continue
    }

    if (token === '--font-bold') {
      args.fontBold = argv[i + 1] || args.fontBold
      i += 1
      continue
    }

    if (token === '--font-regular') {
      args.fontRegular = argv[i + 1] || args.fontRegular
      i += 1
      continue
    }

    if (token === '--help' || token === '-h') {
      console.log(
        `\nUsage: node scripts/generate-resume-share.mjs --input <path> [options]\n\nOptions:\n  --output <path>        Output image path (default: images/social/resume-share.png)\n  --title <text>         Main banner text (default: David Dangerfield Resume)\n  --font-bold <path>     Font file for title\n  --font-regular <path>  Font file for (PDF) label\n  -h, --help             Show help\n`,
      )
      process.exit(0)
    }

    fail(`Unknown argument: ${token}`)
  }

  return args
}

function toAbsolute(workspaceRelativeOrAbsolutePath) {
  if (!workspaceRelativeOrAbsolutePath) return ''
  if (workspaceRelativeOrAbsolutePath.startsWith('/')) {
    return workspaceRelativeOrAbsolutePath
  }
  return resolve(ROOT_DIR, workspaceRelativeOrAbsolutePath)
}

function escapeDrawText(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(':', '\\:')
    .replaceAll("'", "\\'")
    .replaceAll(',', '\\,')
}

async function ensureReadable(pathToFile, label) {
  try {
    await access(pathToFile, constants.R_OK)
  } catch {
    fail(`${label} not readable: ${pathToFile}`)
  }
}

function ensureFfmpegInstalled() {
  const check = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' })
  if (check.error || check.status !== 0) {
    fail('ffmpeg is required but was not found on PATH.')
  }
}

function ensureSipsInstalled() {
  const check = spawnSync('sips', ['--help'], { encoding: 'utf8' })
  if (check.error || check.status !== 0) {
    fail('sips is required for PDF input but was not found on PATH.')
  }
}

async function prepareInputSource(inputAbs) {
  const extension = extname(inputAbs).toLowerCase()

  if (extension !== '.pdf') {
    return { sourcePath: inputAbs, tempDir: '' }
  }

  ensureSipsInstalled()

  const tempDir = await mkdtemp(join(tmpdir(), 'resume-share-'))
  const sourcePath = join(tempDir, 'resume-source.png')
  const conversion = spawnSync('sips', ['-s', 'format', 'png', inputAbs, '--out', sourcePath], {
    stdio: 'inherit',
  })

  if (conversion.error || conversion.status !== 0) {
    fail('Failed to extract PNG from PDF input via sips.')
  }

  return { sourcePath, tempDir }
}

function runFfmpeg({ inputAbs, outputAbs, title, fontBoldAbs, fontRegularAbs, faviconAbs }) {
  const titleEscaped = escapeDrawText(title)

  const sceneFilter =
    [
      '[0:v]scale=464:600:flags=lanczos',
      'pad=1200:748:(ow-iw)/2:148:color=0xBFC3C8',
      'crop=1200:630:0:0',
      'gblur=sigma=3',
      'drawbox=x=0:y=0:w=iw:h=ih:color=black@0.06:t=fill',
      'drawbox=x=368:y=148:w=464:h=482:color=white@0.22:t=fill',
    ].join(',') + '[scene]'

  const bannerFilter = [
    "[2:v]format=rgba,geq=r='44-23*Y/147':g='133-39*Y/147':b='138-39*Y/147':a='255'[banner]",
  ].join(',')

  const textFilter =
    [
      '[with_banner]drawbox=x=0:y=140:w=iw:h=8:color=0xC65D2E@0.95:t=fill',
      'drawbox=x=iw-82:y=40:w=52:h=52:color=0xFFFAF2@0.12:t=fill',
      `drawtext=fontfile='${fontBoldAbs}':text='${titleEscaped}':fontcolor=0xFFFAF2:fontsize=54:x=(w-text_w)/2-18:y=42`,
      `drawtext=fontfile='${fontRegularAbs}':text='(PDF)':fontcolor=0xE89C73:fontsize=28:x=(w+text_w)/2+320:y=54`,
    ].join(',') + '[base]'

  const logoFilter = '[1:v]scale=40:40:flags=lanczos,format=rgba[logo]'
  const composeFilter = '[scene][banner]overlay=x=0:y=0[with_banner]'
  const overlayFilter = '[base][logo]overlay=x=main_w-76:y=46:format=auto[out]'
  const filterComplex = `${sceneFilter};${bannerFilter};${composeFilter};${textFilter};${logoFilter};${overlayFilter}`

  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      inputAbs,
      '-i',
      faviconAbs,
      '-f',
      'lavfi',
      '-i',
      'color=c=black:s=1200x148',
      '-filter_complex',
      filterComplex,
      '-map',
      '[out]',
      '-frames:v',
      '1',
      '-update',
      '1',
      outputAbs,
    ],
    { stdio: 'inherit' },
  )

  if (result.error || result.status !== 0) {
    fail('ffmpeg failed to generate the image.')
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.input) {
    fail('Missing required argument: --input')
  }

  const inputAbs = toAbsolute(args.input)
  const outputAbs = toAbsolute(args.output)
  const fontBoldAbs = toAbsolute(args.fontBold)
  const fontRegularAbs = toAbsolute(args.fontRegular)
  const faviconAbs = toAbsolute(FAVICON_PATH)

  ensureFfmpegInstalled()
  await ensureReadable(inputAbs, 'Input image')
  await ensureReadable(fontBoldAbs, 'Bold font')
  await ensureReadable(fontRegularAbs, 'Regular font')
  await ensureReadable(faviconAbs, 'Favicon image')
  await mkdir(dirname(outputAbs), { recursive: true })

  const prepared = await prepareInputSource(inputAbs)

  runFfmpeg({
    inputAbs: prepared.sourcePath,
    outputAbs,
    title: args.title,
    fontBoldAbs,
    fontRegularAbs,
    faviconAbs,
  })

  if (prepared.tempDir) {
    await rm(prepared.tempDir, { recursive: true, force: true })
  }

  console.log(`\nGenerated: ${outputAbs}`)
}

main().catch((err) => {
  fail(err.message)
})
