import prompts from 'prompts'

import type { CWA_Command } from '../index'

export enum AuthFlow {
  WebCrypto = 'webcrypto',
  WalletAuth = 'walletauth',
}

/**
 * Detect the useWebcrypto and useWalletauth options passed in from the user. If they
 * haven't passed one of those options, ask them if they want to use Device Linking or
 * WalletAuth as their auth flow
 *
 * @param program
 */
const setAuthFlow = async (program: CWA_Command): Promise<AuthFlow> => {
  if (program.useWebcrypto) {
    return AuthFlow.WebCrypto
  }

  if (program.useWalletauth) {
    return AuthFlow.WalletAuth
  }

  // If the user hasn't explicitly requested an auth flow, ask them
  if (!program.useWebcrypto && !program.useWalletauth) {
    try {
      const res = await prompts({
        type: 'select',
        name: 'authFlow',
        message: 'Which ODD auth flow would you like to use?',
        choices: [
          {
            title: 'WebCrypto',
            // @ts-ignore-next-line
            description:
              'Learn more here: https://github.com/oddsdk/odd-app-template',
            value: 'webcrypto',
          },
          {
            title: 'WalletAuth',
            // @ts-ignore-next-line
            description:
              'Learn more here: https://github.com/oddsdk/walletauth',
            value: 'walletauth',
          },
        ],
        initial: 0,
      })

      return res.authFlow.trim()
    } catch (error) {
      console.error(error)
    }
  }

  // Default to Device Linking
  return AuthFlow.WebCrypto
}

export default setAuthFlow
