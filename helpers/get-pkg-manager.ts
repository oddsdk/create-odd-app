import { execSync } from 'child_process'

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

const getPkgManager = (): PackageManager => {
  try {
    const userAgent = process.env.npm_config_user_agent;
    if (userAgent) {
      if (userAgent.startsWith('npm')) {
        return 'npm';
      } else if (userAgent.startsWith('yarn')) {
        return 'yarn';
      } else if (userAgent.startsWith('pnpm')) {
        return 'pnpm';
      }
    }
    try {

      execSync('npm --version', { stdio: 'ignore' });
      return 'npm';
      // execSync('yarn --version', { stdio: 'ignore' });
      // return 'yarn';
    } catch {
      execSync('pnpm --version', { stdio: 'ignore' });
      return 'pnpm';
    }
  } catch {
    return 'npm';
  }
}

export default getPkgManager
