import chalk from 'chalk'
import fs from 'fs'
import prompts from 'prompts'

import { PINK } from './colours'
import { AuthFlow } from './set-auth-flow'
import { Framework } from './set-framework'

export type AppInfo = {
  appName: string
  appDescription: string
  appURL: string
  // appImageURL: string
}

// Default values from WAT
const APP_INFO_WAT = {
  appName: 'Awesome Webnative App',
  appDescription: 'This is another awesome Webnative app.',
  appURL: 'https://webnative.netlify.app',
  // appImageURL: `https://webnative.netlify.app/preview.png`,
}

// WalletAuth has slightly different default values
const APP_INFO_WALLET_AUTH = {
  ...APP_INFO_WAT,
  appName: 'Awesome Webnative WalletAuth App',
  appURL: 'https://webnative-walletauth.netlify.app',
  // appImageURL: `https://webnative-walletauth.netlify.app/preview.png`,
}

/**
 * Prompt the user to edit the `app-info.ts` values of the selected template
 *
 * @param authFlow
 */
const setAppInfo = async (
  authFlow: AuthFlow,
): Promise<AppInfo | undefined> => {
  try {
    const confirmRes = await prompts({
      type: 'confirm',
      name: 'editAppInfo',
      message: `Would you like to modify your app's name(title/og:title), description(og:description) or URL(base url)?`,
      initial: false,
    })

    // If the user has said yes, prompt them to edit the individual values
    if (confirmRes.editAppInfo) {
      let appInfo =
        authFlow === AuthFlow.WalletAuth ? { ...APP_INFO_WALLET_AUTH } : { ...APP_INFO_WAT }

      const appNameRes = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter your app name(title, og:title, etc...)',
        initial: appInfo.appName,
      })
      appInfo.appName = appNameRes.value

      const appDescriptionRes = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter your app description(og:description, etc...)',
        initial: appInfo.appDescription,
      })
      appInfo.appDescription = appDescriptionRes.value

      const appURLRes = await prompts({
        type: 'text',
        name: 'value',
        message: 'Please enter your app URL(base url)',
        initial: appInfo.appURL,
      })
      appInfo.appURL = appURLRes.value

      // const appImageURLRes = await prompts({
      //   type: 'text',
      //   name: 'value',
      //   message: 'Please enter your app image URL(og:image)',
      //   initial: appInfo.appImageURL,
      // })
      // appInfo.appImageURL = appImageURLRes.value

      return appInfo
    }
  } catch (error) {
    console.error(error)
  }

  return
}

type WriteAppInfoParams = {
  appInfo: AppInfo
  authFlow: AuthFlow
  framework: Framework
  root: string
}

export const writeAppInfo = async ({
  appInfo,
  authFlow,
  framework,
  root,
}: WriteAppInfoParams): Promise<void> => {
  try {
    const appInfoPath = `${root}/src/lib/app-info.ts`
    const originalFile = await fs.promises.readFile(appInfoPath, 'utf8')
    let defaultAppInfo =
      authFlow === AuthFlow.WalletAuth ? { ...APP_INFO_WALLET_AUTH } : { ...APP_INFO_WAT }

    if (framework === Framework.React) {
      defaultAppInfo.appURL = authFlow === AuthFlow.WalletAuth ? 'https://webnative-walletauth-react.netlify.app' : 'https://webnative-react.netlify.app'
    }

    // Replace appName
    const appNameRegex = new RegExp(
      `appName = '${defaultAppInfo.appName}'`,
      'g',
    )
    let edits = originalFile.replace(
      appNameRegex,
      `appName = '${appInfo.appName}'`,
    )

    // Replace appDescription
    const appDescriptionRegex = new RegExp(
      `appDescription = '${defaultAppInfo.appDescription}'`,
      'g',
    )
    edits = edits.replace(
      appDescriptionRegex,
      `appDescription = '${appInfo.appDescription}'`,
    )

    // Replace appUrL
    const appUrlRegex = new RegExp(`appURL = '${defaultAppInfo.appURL}'`, 'g')
    edits = edits.replace(appUrlRegex, `appURL = '${appInfo.appURL}'`)

    // Replace appImageURL
    // const appImageURLRegex = new RegExp(
    //   `appImageURL = \`${defaultAppInfo.appURL}/preview.png\``,
    //   'g',
    // )
    // edits = edits.replace(
    //   appImageURLRegex,
    //   `appImageURL = '${appInfo.appImageURL}'`,
    // )

    await fs.promises.writeFile(appInfoPath, edits, 'utf8')

    console.log()
    console.log(`Writing to app-info.ts at ${chalk.hex(PINK)(appInfoPath)}.`)
    console.log()
  } catch (err) {
    console.error(err)
  }
}

export default setAppInfo
