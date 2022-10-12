/* eslint-disable import/no-extraneous-dependencies */
import retry from 'async-retry'
import chalk from 'chalk'
import cpy from 'cpy'
import fs from 'fs'
import os from 'os'
import path from 'path'

import {
  downloadAndExtractRepo,
  getRepoInfo,
  hasRepo,
  RepoInfo,
} from './helpers/examples'
import { makeDir } from './helpers/make-dir'
import { tryGitInit } from './helpers/git'
import { install } from './helpers/install'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { getOnline } from './helpers/is-online'
import { isWriteable } from './helpers/is-writeable'
import type { AuthFlow } from './helpers/set-auth-flow'
import type { Framework } from './helpers/set-framework'
import type { PackageManager } from './helpers/get-pkg-manager'

export class DownloadError extends Error {}

type Options = {
  appPath: string;
  authFlow: AuthFlow;
  framework: Framework;
  packageManager: PackageManager;
  example?: string;
  examplePath?: string;
  typescript?: boolean;
}

type ReposType = {
  [authFlow: string]: {
    [framework: string]: string
  }
}

const Repos: ReposType = {
  deviceLinking: {
    react: 'https://github.com/webnative-examples/webnative-app-template-react',
    sveltekit: 'https://github.com/fission-codes/webnative-app-template',
  },
  walletauth: {
    react: 'https://github.com/webnative-examples/walletauth-react',
    sveltekit: 'https://github.com/webnative-examples/walletauth',
  },
}

const createWebnativeApp = async ({
  appPath,
  authFlow,
  framework,
  packageManager,
}: Options): Promise<void> => {
  let repoInfo: RepoInfo | undefined
  let repoUrl: URL | undefined

  if (framework && authFlow) {
    console.log("authFlow", authFlow);
    console.log("framework", framework);
    console.log("Repos[authFlow][framework]", Repos[authFlow][framework]);
    try {
      repoUrl = new URL(Repos[authFlow][framework])
    } catch (error: any) {
      if (error.code !== 'ERR_INVALID_URL') {
        console.error(error)
        process.exit(1)
      }
    }
    console.log('repoUrl', repoUrl)
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
      console.log("repoInfo", repoInfo);

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

  console.log(`Creating a new Webnative app in ${chalk.green(root)}.`);

  process.chdir(root);

  const packageJsonPath = path.join(root, "package.json");
  let hasPackageJson = false;

  if (repoInfo && repoUrl) {
    /**
     * Clone the repo if it exists
     */
    try {
      console.log(
        `Downloading files from repo ${chalk.cyan(
          `${repoUrl}`
        )}. This might take a moment.`
      )
      const repoInfo2 = repoInfo;
      await retry(() => downloadAndExtractRepo(root, repoInfo2), {
        // @ts-ignore-next-line
        retries: 3,
      });
    } catch (reason) {
      function isErrorLike(err: unknown): err is { message: string } {
        return (
          typeof err === "object" &&
          err !== null &&
          typeof (err as { message?: unknown }).message === "string"
        );
      }
      throw new DownloadError(
        isErrorLike(reason) ? reason.message : reason + ""
      );
    }
    console.log("root", root);

    hasPackageJson = fs.existsSync(packageJsonPath);
    if (hasPackageJson) {
      console.log("Installing packages. This might take a couple of minutes.");

      await install(root, null, { packageManager, isOnline });
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

  console.log(`${chalk.green("Success!")} Created ${appName} at ${appPath}`);

  if (hasPackageJson) {
    console.log("Inside that directory, you can run several commands:");
    console.log();
    console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
    console.log("    Starts the development server.");
    console.log();
    console.log(
      chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`)
    );
    console.log("    Builds the app for production.");
    console.log();
    console.log(chalk.cyan(`  ${packageManager} start`));
    console.log("    Runs the built app in production mode.");
    console.log();
    console.log("We suggest that you begin by typing:");
    console.log();
    console.log(chalk.cyan("  cd"), cdpath);
    console.log(
      `  ${chalk.cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`
    );
  }
  console.log();
};

export default createWebnativeApp
