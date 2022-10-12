import chalk from 'chalk'
import path from 'path'
import prompts from 'prompts'

import type { CWA_Command } from '../index'
import { validateNpmName } from './validate-pkg'

/**
 * If the projectPath hasn't been set, ask the user to set it
 *
 * @param projectPath
 */
const setProjectPath = async (
  projectPath: string,
  program: CWA_Command,
): Promise<string> => {
  if (!projectPath) {
    try {
      const res = await prompts({
        type: 'text',
        name: 'path',
        message: 'What is your project named?',
        initial: 'my-webnative-app',
        validate: (name) => {
          const validation = validateNpmName(path.basename(path.resolve(name)))
          if (validation.valid) {
            return true
          }
          return 'Invalid project name: ' + validation.problems![0]
        },
      })

      if (typeof res.path === 'string') {
        return res.path.trim()
      }
    } catch (error) {
      console.error(error)
    }

    console.log(
      '\nPlease specify the project directory:\n' +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          '<project-directory>'
        )}\n` +
        'For example:\n' +
        `  ${chalk.cyan(program.name())} ${chalk.green('my-webnative-app')}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    )
    process.exit(1)
  }

  return projectPath
}

export default setProjectPath
