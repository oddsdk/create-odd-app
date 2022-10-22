import chalk from 'chalk'
import { execSync } from 'child_process'
import fs from 'fs'
import prompts from 'prompts'

import { PINK } from './colours'
import { AuthFlow } from './set-auth-flow'
import { Framework } from './set-framework'

/**
 * Prompt the user to choose to use TypeScript or not(default is to use TS)
 */
const setTypescript = async (): Promise<boolean> => {
  try {
    const confirmRes = await prompts({
      type: 'confirm',
      name: 'useTypescript',
      message: `Would you like to remove TypeScript from your project?`,
      initial: false,
    })

    return confirmRes.useTypescript
  } catch (error) {
    console.error(error)
  }

  return false
}

/**
 * Switch a React codebase to JavaScript
 *
 * @param root
 */
const switchReactToJavascript = async (root: string): Promise<void> => {
  try {
    const srcPath = `${root}/src`

    const packagesToRemove: {
      dependencies: string[]
      devDependencies: string[]
    } = {
      dependencies: [
        '@types/jest',
        '@types/node',
        '@types/react',
        '@types/react-dom',
      ],
      devDependencies: [
        '@types/qrcode-svg',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'typescript',
      ],
    }

    // Remove TS-related packages
    const packageJsonFile = JSON.parse(
      await fs.promises.readFile(`${root}/package.json`, 'utf8'),
    )
    packagesToRemove.dependencies.forEach(
      (pkg) => delete packageJsonFile.dependencies[pkg],
    )
    packagesToRemove.devDependencies.forEach(
      (pkg) => delete packageJsonFile.devDependencies[pkg],
    )

    // Navigate to the root of the codebase
    execSync(`cd ${root}`, {
      stdio: 'inherit',
    })

    /**
     * This command catches after converting TS files to JS because type
     * imports are no longer available, but we don't want that to interrupt
     * the flow of the parent function
     */
    try {
      execSync('npx tsc --jsx preserve -t es2020 --noEmit false', {
        stdio: 'ignore',
      })
    } catch (error) {}

    // Remove the tsconfig
    execSync('rm tsconfig.json', {
      stdio: 'inherit',
    })

    // Remove any .ts and .tsx files from the src directiory
    execSync(
      `cd ${srcPath} & find . -type f -name '*.ts' -exec rm {} + & find . -type f -name '*.tsx' -exec rm {} +`,
      {
        stdio: 'inherit',
      },
    )

    // Remove TS-related code from eslint
    const eslintrcFile = await fs.promises.readFile(
      `${root}/.eslintrc.js`,
      'utf8',
    )

    // Replace extends
    let eslintrcEdits = eslintrcFile.replace(
      '"plugin:@typescript-eslint/recommended",',
      '',
    )
    eslintrcEdits = eslintrcEdits.replace(
      'parser: "@typescript-eslint/parser",',
      '',
    )
    eslintrcEdits = eslintrcEdits.replace(
      'plugins: ["react", "@typescript-eslint"]',
      'plugins: ["react"]',
    )
    eslintrcEdits = eslintrcEdits.replace(
      '"@typescript-eslint/no-explicit-any": "off",',
      '',
    )

    // Write the updated eslintrc file
    await fs.promises.writeFile(`${root}/.eslintrc.js`, eslintrcEdits, 'utf8')

    // Write the updated package.json file
    await fs.promises.writeFile(
      `${root}/package.json`,
      JSON.stringify(packageJsonFile, null, 2),
      'utf8',
    )
  } catch (err) {
    console.error(err)
  }
}

/**
 * Switch a SvelteKit codebase to JavaScript
 *
 * @param root
 */
const switchSvelteKitToJavascript = async (root: string): Promise<void> => {
  try {
    const srcPath = `${root}/src`

    const packagesToRemove: {
      dependencies: string[]
      devDependencies: string[]
    } = {
      dependencies: [
        '@types/jest',
        '@types/node',
        '@types/react',
        '@types/react-dom',
      ],
      devDependencies: [
        '@types/qrcode-svg',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'typescript',
      ],
    }

    // Remove TS-related packages
    const packageJsonFile = JSON.parse(
      await fs.promises.readFile(`${root}/package.json`, 'utf8'),
    )
    packagesToRemove.dependencies.forEach(
      (pkg) => delete packageJsonFile.dependencies[pkg],
    )
    packagesToRemove.devDependencies.forEach(
      (pkg) => delete packageJsonFile.devDependencies[pkg],
    )

    // Navigate to the root of the codebase
    execSync(`cd ${root}`, {
      stdio: 'inherit',
    })

    /**
     * This command catches after converting TS files to JS because type
     * imports are no longer available, but we don't want that to interrupt
     * the flow of the parent function
     */
    try {
      execSync('npx tsc --jsx preserve -t es2020 --noEmit false', {
        stdio: 'ignore',
      })
    } catch (error) {}

    // Remove the tsconfig
    execSync('rm tsconfig.json', {
      stdio: 'inherit',
    })

    // Remove any .ts and .tsx files from the src directiory
    execSync(
      `cd ${srcPath} & find . -type f -name '*.ts' -exec rm {} + & find . -type f -name '*.tsx' -exec rm {} +`,
      {
        stdio: 'inherit',
      },
    )

    // Remove TS-related code from eslint
    const eslintrcFile = await fs.promises.readFile(
      `${root}/.eslintrc.js`,
      'utf8',
    )

    // Replace extends
    let eslintrcEdits = eslintrcFile.replace(
      '"plugin:@typescript-eslint/recommended",',
      '',
    )
    eslintrcEdits = eslintrcEdits.replace(
      'parser: "@typescript-eslint/parser",',
      '',
    )
    eslintrcEdits = eslintrcEdits.replace(
      'plugins: ["react", "@typescript-eslint"]',
      'plugins: ["react"]',
    )
    eslintrcEdits = eslintrcEdits.replace(
      '"@typescript-eslint/no-explicit-any": "off",',
      '',
    )

    // Write the updated eslintrc file
    await fs.promises.writeFile(`${root}/.eslintrc.js`, eslintrcEdits, 'utf8')

    // Write the updated package.json file
    await fs.promises.writeFile(
      `${root}/package.json`,
      JSON.stringify(packageJsonFile, null, 2),
      'utf8',
    )
  } catch (err) {
    console.error(err)
  }
}

type FunctionMap = {
  [Framework.React]: (root: string) => Promise<void>,
  [Framework.SvelteKit]: (root: string) => Promise<void>,
}
const functionMap: FunctionMap = {
  [Framework.React]: (root: string) => switchReactToJavascript(root),
  [Framework.SvelteKit]: (root: string) => switchSvelteKitToJavascript(root),
}

type SwitchToJavaScriptParams = {
  framework: Framework
  root: string
}

/**
 * Convert a TS project to JS if the user as set `useTypescript` to `false`
 *
 * @param SwitchToJavaScriptParams
 */
export const switchToJavaScript = async ({
  framework,
  root,
}: SwitchToJavaScriptParams): Promise<void> => {
  try {
    await functionMap[framework](root)

    console.log()
    console.log(
      `Removing TypeScript from your project at ${chalk.hex(PINK)(root)}.`,
    )
    console.log()
  } catch (err) {
    console.error(err)
  }
}

export default setTypescript
