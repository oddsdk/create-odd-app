#!/usr/bin/env node
import chalk from 'chalk'
import { Command, type Command as CommandType } from 'commander'
import path from 'path'
import checkForUpdate from 'update-check'

import createWebnativeApp, { DownloadError } from './create-webnative-app'
import getPkgManager from './helpers/get-pkg-manager'
import validateNpmName from './helpers/validate-pkg'
import setAuthFlow, { AuthFlow } from './helpers/set-auth-flow'
import setFramework, { Framework } from './helpers/set-framework'
import setProjectPath from './helpers/set-project-path'
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
    '--ts, --typescript',
    `
  Initialize as a TypeScript project.
`
  )
  .option(
    '--use-npm',
    `
  Explicitly tell the CLI to bootstrap the app using npm
`
  )
  .option(
    '--use-pnpm',
    `
  Explicitly tell the CLI to bootstrap the app using pnpm
`
  )
  .option(
    '--use-sveltekit',
    `
  Explicitly tell the CLI to build the application using SvelteKit
`
  )
  .option(
    '--use-react',
    `
  Explicitly tell the CLI to build the application using React
`
  )
  .option(
    '--use-walletauth',
    `
  Explicitly tell the CLI to build the application using Webnative's WalletAuth flow
`
  )
  .option(
    '--use-devicelinking',
    `
  Explicitly tell the CLI to build the application using Webnative's Device Linking flow
`
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

    problems!.forEach((p) => console.error(`    ${chalk.red.bold('*')} ${p}`))
    process.exit(1)
  }

  const packageManager = !!program.useNpm
    ? 'npm'
    : !!program.usePnpm
    ? 'pnpm'
    : getPkgManager()

  try {
    await createWebnativeApp({
      appPath: resolvedProjectPath,
      authFlow,
      framework,
      packageManager,
      // typescript: program.typescript,
    })
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason
    }

    // const res = await prompts({
    //   type: 'confirm',
    //   name: 'builtin',
    //   message:
    //     `Could not download '${example}' because of a connectivity issue between your machine and GitHub.\n` +
    //     `Do you want to use the default template instead?`,
    //   initial: true,
    // })
    // if (!res.builtin) {
    //   throw reason
    // }

    await createWebnativeApp({
      appPath: resolvedProjectPath,
      authFlow: AuthFlow.deviceLinking,
      framework: Framework.sveltekit,
      packageManager,
      // typescript: program.typescript,
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
