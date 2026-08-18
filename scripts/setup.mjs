#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function run(bin, args, opts = {}) {
  const result = spawnSync(bin, args, {
    stdio: 'inherit',
    env: process.env,
    ...opts,
  })

  if (result.error || result.status !== 0) {
    return false
  }

  return true
}

function capture(bin, args) {
  return spawnSync(bin, args, { encoding: 'utf8' })
}

function hasDrawtextFilter(ffmpegBin) {
  const check = capture(ffmpegBin, ['-hide_banner', '-filters'])
  if (check.error || check.status !== 0) {
    return false
  }

  return check.stdout.includes('drawtext')
}

function ensureFfmpegFullOnMac() {
  if (process.platform !== 'darwin') {
    console.log('Skipping Homebrew ffmpeg-full setup (non-macOS platform).')
    return
  }

  const brewOk = run('brew', ['--version'])
  if (!brewOk) {
    fail(
      'Homebrew is required on macOS to install ffmpeg-full. Install Homebrew and rerun npm run setup:init.',
    )
  }

  const ffmpegCandidates = ['ffmpeg', '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg']

  for (const bin of ffmpegCandidates) {
    const versionCheck = capture(bin, ['-version'])
    if (versionCheck.error || versionCheck.status !== 0) {
      continue
    }

    if (hasDrawtextFilter(bin)) {
      console.log(`FFmpeg drawtext support detected via ${bin}.`)
      return
    }
  }

  console.log('Installing ffmpeg-full via Homebrew (required for drawtext)...')
  const installOk = run('brew', ['install', 'ffmpeg-full'])
  if (!installOk) {
    fail('Failed to install ffmpeg-full with Homebrew.')
  }

  const fullBin = '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg'
  if (!hasDrawtextFilter(fullBin)) {
    fail(
      'ffmpeg-full installed but drawtext filter is still unavailable. Check Homebrew installation.',
    )
  }

  console.log('ffmpeg-full installed and drawtext support verified.')
}

function main() {
  console.log('Running initial setup checks...')
  ensureFfmpegFullOnMac()
  console.log('Initial setup checks complete. Running npm install next...')
}

main()
