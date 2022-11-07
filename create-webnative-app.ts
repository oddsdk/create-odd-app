import retry from 'async-retry'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

import { ORANGE } from './helpers/colours'
import makeDir from './helpers/make-dir'
import {
  tryGitInit,
  downloadAndExtractRepo,
  getRepoInfo,
  hasRepo,
  RepoInfo,
} from './helpers/git'
import install from './helpers/install'
import isFolderEmpty from './helpers/is-folder-empty'
import getOnline from './helpers/is-online'
import isWriteable from './helpers/is-writeable'
import { writeAppInfo, type AppInfo } from './helpers/set-app-info'
import { switchToJavaScript } from './helpers/set-typescript'
import type { AuthFlow } from './helpers/set-auth-flow'
import type { Framework } from './helpers/set-framework'
import type { PackageManager } from './helpers/get-pkg-manager'

export class DownloadError extends Error {}

type Options = {
  appInfo?: AppInfo
  appPath: string
  authFlow: AuthFlow
  framework: Framework
  packageManager: PackageManager
  removeTypescript?: boolean
}

type ReposType = {
  [authFlow: string]: {
    [framework: string]: string
  }
}

const WEBNATIVE_EXAMPLES_URL = 'https://github.com/webnative-examples/'
const Repos: ReposType = {
  deviceLinking: {
    react: `${WEBNATIVE_EXAMPLES_URL}webnative-app-template-react`,
    sveltekit: `${WEBNATIVE_EXAMPLES_URL}webnative-app-template`,
  },
  walletauth: {
    react: `${WEBNATIVE_EXAMPLES_URL}walletauth-react`,
    sveltekit: `${WEBNATIVE_EXAMPLES_URL}walletauth`,
  },
};

/**
 * Kick off the app creation using the selection options passed in by the user
 *
 * @param Options
 */
const createWebnativeApp = async ({
  appInfo,
  appPath,
  authFlow,
  framework,
  packageManager,
  removeTypescript,
}: Options): Promise<void> => {
  let repoInfo: RepoInfo | undefined
  let repoUrl: URL | undefined

  if (framework && authFlow) {
    try {
      repoUrl = new URL(Repos[authFlow][framework])
    } catch (error: any) {
      if (error.code !== 'ERR_INVALID_URL') {
        console.error(error)
        process.exit(1)
      }
    }

    if (repoUrl) {
      if (repoUrl.origin !== 'https://github.com') {
        console.error(
          `Invalid URL: ${chalk.red(
            `"${repoUrl}"`
          )}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`
        );
        process.exit(1)
      }

      repoInfo = await getRepoInfo(repoUrl)

      if (!repoInfo) {
        console.error(
          `Found invalid GitHub URL: ${chalk.red(
            `"${repoUrl}"`
          )}. Please fix the URL and try again.`
        );
        process.exit(1);
      }

      const found = await hasRepo(repoInfo);

      if (!found) {
        console.error(
          `Could not locate the repository for ${chalk.red(
            `"${repoUrl}"`
          )}. Please check that the repository exists and try again.`
        );
        process.exit(1);
      }
    }
  }

  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log();
  console.log(`Creating a new Webnative app in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  const packageJsonPath = path.join(root, "package.json");
  let hasPackageJson = false;

  if (repoInfo && repoUrl) {
    /**
     * Clone the repo if it exists
     */
    try {
      console.log(
        `Downloading files from repo ${chalk.green(
          `${repoUrl}`,
        )}. This might take a moment.`,
      )
      console.log()
      const repoInfo2 = repoInfo
      await retry(() => downloadAndExtractRepo(root, repoInfo2), {
        // @ts-ignore-next-line
        retries: 3,
      })
    } catch (reason) {
      function isErrorLike(err: unknown): err is { message: string } {
        return (
          typeof err === 'object' &&
          err !== null &&
          typeof (err as { message?: unknown }).message === 'string'
        )
      }
      throw new DownloadError(
        isErrorLike(reason) ? reason.message : reason + '',
      )
    }

    // Write app-info.ts values
    if (appInfo) {
      await writeAppInfo({ appInfo, authFlow, framework, root })
    }

    // Conver TS project to JS
    if (removeTypescript) {
      await switchToJavaScript({ framework, root })
    }

    hasPackageJson = fs.existsSync(packageJsonPath)
    if (hasPackageJson) {
      console.log()
      console.log('Installing packages. This might take a couple of minutes...')
      console.log()

      await install(root, null, { packageManager, isOnline })
    }
  }

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log()
  console.log(
    `${chalk.hex(ORANGE)(`    %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
@@@@@%     %@@@@@@%         %@@@@@@@%     %@@@@@
@@@@@       @@@@@%            @@@@@@       @@@@@
@@@@@%      @@@@@             %@@@@@      %@@@@@
@@@@@@%     @@@@@     %@@%     @@@@@     %@@@@@@
@@@@@@@     @@@@@    %@@@@%    @@@@@     @@@@@@@
@@@@@@@     @@@@%    @@@@@@    @@@@@     @@@@@@@
@@@@@@@    %@@@@     @@@@@@    @@@@@%    @@@@@@@
@@@@@@@    @@@@@     @@@@@@    %@@@@@    @@@@@@@
@@@@@@@    @@@@@@@@@@@@@@@@     @@@@@    @@@@@@@
@@@@@@@    %@@@@@@@@@@@@@@@     @@@@%    @@@@@@@
@@@@@@@     %@@%     @@@@@@     %@@%     @@@@@@@
@@@@@@@              @@@@@@              @@@@@@@
@@@@@@@%            %@@@@@@%            %@@@@@@@
@@@@@@@@@%        %@@@@@@@@@@%        %@@@@@@@@@
%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%    `)}`,
  )
  console.log()
  console.log()

  console.log(`${chalk.green("Success!")} Created ${chalk.green(appName)} at ${chalk.green(appPath)}`);

  if (hasPackageJson) {
    console.log("Inside that directory, you can run several commands:");
    console.log();
    console.log(`  ${packageManager} ${useYarn ? "" : "run "}dev`);
    console.log("    Starts the development server.");
    console.log();
    console.log(
      `  ${packageManager} ${useYarn ? "" : "run "}build`
    );
    console.log("    Builds the app for production.");
    console.log();
    console.log("We suggest you begin by typing:");
    console.log();
    console.log(`  cd ${chalk.green(cdpath)}`);
    console.log(
      `  ${packageManager} ${useYarn ? "" : "run "}dev`
    );
  }
  console.log();
};

export default createWebnativeApp
