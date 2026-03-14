import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(SCRIPTS_DIR, '..')

const generatedFiles = [
  'index.html',
  'about/index.html',
  'services/index.html',
  'contact/index.html',
]

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run('npm', ['run', 'build'])

const check = spawnSync('git', ['diff', '--exit-code', '--', ...generatedFiles], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
})

if (check.status !== 0) {
  console.error('\nGenerated HTML files are out of date. Run: npm run build')
  process.exit(1)
}

console.log('\nGenerated HTML files are in sync.')
