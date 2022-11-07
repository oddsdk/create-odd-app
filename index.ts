#!/usr/bin/env node
import chalk from 'chalk'
import { Command, type Command as CommandType } from 'commander'
import path from 'path'
import checkForUpdate from 'update-check'

import createWebnativeApp, { DownloadError } from './create-webnative-app'
import getPkgManager from './helpers/get-pkg-manager'
import validateNpmName from './helpers/validate-pkg'
import setAppInfo, { AppInfo } from './helpers/set-app-info'
import setAuthFlow, { AuthFlow } from './helpers/set-auth-flow'
import setFramework, { Framework } from './helpers/set-framework'
import setProjectPath from './helpers/set-project-path'
import setTypescript from './helpers/set-typescript'
import packageJson from './package.json'

export type CWA_Command = CommandType & {
  ts?: boolean;
  typescript?: boolean;
  useNpm?: boolean;
  usePnpm?: boolean;
  useDeviceLinking?: boolean;
  useWalletauth?: boolean;
  useSveltekit?: boolean;
  useReact?: boolean;
};

let projectPath: string = '';

/**
 * Flow to be run when `create-webnative-app` is called. Can be called as:
 * `create-webnative-app` or `create-webnative-app <my-app-name>`
 * Args can also be passed in: --use-npm, --use-yarn, --use-pnpm,
 * --use-sveltekit, --use-react, --use-walletauth, --use-deviceLinking
 */
const program: CWA_Command = new Command(packageJson.name)
  .version(packageJson.version)
  .argument('[project-directory]')
  .usage(`${chalk.green('[project-directory]')} [options]`)
  .action((name) => {
    if (typeof name === 'string') {
      projectPath = name.trim()
    }
  })
  .option(
    '--use-npm',
    `
  Explicitly tell the CLI to bootstrap the app using npm(This is the default option anyway)
`,
  )
  .option(
    '--use-yarn',
    `
  Explicitly tell the CLI to bootstrap the app using yarn
`,
  )
  .option(
    '--use-pnpm',
    `
  Explicitly tell the CLI to bootstrap the app using pnpm
`,
  )
  .option(
    '--use-sveltekit',
    `
  Explicitly tell the CLI to build the application using SvelteKit
`,
  )
  .option(
    '--use-react',
    `
  Explicitly tell the CLI to build the application using React
`,
  )
  .option(
    '--use-walletauth',
    `
  Explicitly tell the CLI to build the application using Webnative's WalletAuth flow
`,
  )
  .option(
    '--use-devicelinking',
    `
  Explicitly tell the CLI to build the application using Webnative's Device Linking flow
`,
  )
  .allowUnknownOption()
  .parse(process.argv)

const run = async (): Promise<void> => {
  // If the user hasn't explicitly set a project path, ask them to
  projectPath = await setProjectPath(projectPath, program)

  // Detect the selected auth flow or ask the user which they'd prefer
  const authFlow = await setAuthFlow(program)

  // Detect the selected framework or ask the user which they'd prefer
  const framework = await setFramework(program)

  // Ask the user if they'd like to remove TypeScript(currently only supported in the React build)
  const removeTypescript = framework === Framework.React ? await setTypescript() : false

  // Ask the user if they would like to change the default app-info.ts values(og:title, og:description, etc...)
  const appInfo = await setAppInfo(authFlow)

  // Run NPM validation checks against projectName
  const resolvedProjectPath = path.resolve(projectPath)
  const projectName = path.basename(resolvedProjectPath)
  const { valid, problems } = validateNpmName(projectName)
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `'${projectName}'`
      )} because of npm naming restrictions:`
    )

    problems!.forEach((p) => console.error(` ${chalk.red.bold('*')} ${p}`))
    process.exit(1)
  }

  const packageManager = !!program.useNpm
    ? 'npm'
    : !!program.usePnpm
    ? 'pnpm'
    : getPkgManager()

  try {
    await createWebnativeApp({
      appInfo,
      appPath: resolvedProjectPath,
      authFlow,
      framework,
      packageManager,
      removeTypescript,
    })
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason
    }

    await createWebnativeApp({
      appInfo,
      appPath: resolvedProjectPath,
      authFlow: AuthFlow.DeviceLinking,
      framework: Framework.SvelteKit,
      packageManager,
      removeTypescript,
    })
  }
}

const update = checkForUpdate(packageJson).catch(() => null)

const notifyUpdate = async (): Promise<void> => {
  try {
    const res = await update
    if (res?.latest) {
      const pkgManager = getPkgManager()
      console.log(
        chalk.yellow.bold('A new version of `create-webnative-app` is available!') +
          '\n' +
          'You can update by running: ' +
          chalk.cyan(
            pkgManager === 'yarn'
              ? 'yarn global add create-webnative-app'
              : `${pkgManager} install --global create-webnative-app`
          ) +
          '\n'
      )
    }
    process.exit()
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log()
    console.log('Aborting installation.')
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`)
    } else {
      console.log(
        chalk.red('Unexpected error. Please report it as a bug:') + '\n',
        reason
      )
    }
    console.log()

    await notifyUpdate()

    process.exit(1)
  })
