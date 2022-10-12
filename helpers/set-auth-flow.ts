import prompts from 'prompts'

import type { CWA_Command } from '../index'

export enum AuthFlow {
  deviceLinking,
  walletauth,
}

/**
 * Detect the useDeviceLinking and useWalletauth options passed in from the user. If they
 * haven't passed one of those options, ask them if they want to use Device Linking or
 * WalletAuth as their auth flow
 *
 * @param program
 */
const setAuthFlow = async (program: CWA_Command): Promise<AuthFlow> => {
  if (program.useDeviceLinking) {
    return AuthFlow.deviceLinking
  }

  if (program.useWalletauth) {
    return AuthFlow.walletauth
  }

  // If the user hasn't explicitly requested an auth flow, ask them
  if (!program.useDeviceLinking && !program.useWalletauth) {
    try {
      const res = await prompts({
        type: "select",
        name: "authFlow",
        message: "Which Webnative auth flow would you like to use?",
        choices: [
          {
            title: "Device Linking",
            // @ts-ignore-next-line
            description:
              "Learn more here: https://github.com/fission-codes/webnative-app-template",
            value: "deviceLinking",
          },
          {
            title: "WalletAuth",
            // @ts-ignore-next-line
            description:
              "Learn more here: https://github.com/webnative-examples/walletauth",
            value: "walletauth",
          },
        ],
        initial: 1,
      });

      return res.authFlow.trim()
    } catch (error) {
      console.error(error)
    }
  }

  // Default to Device Linking
  return AuthFlow.deviceLinking
}

export default setAuthFlow