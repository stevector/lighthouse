import {existsSync} from 'fs';
import {join as joinPath} from 'path';

import {Configstore, inquirer} from './shim-modules';

const log = require('lighthouse-logger');

const MAXIMUM_WAIT_TIME = 20 * 1000;

const MESSAGE = [
  `${log.reset}Lighthouse is requesting permission to anonymoously report back runtime exceptions.\n  `,
  `${log.reset}This can include data such as the test URL, its subresources, your OS, Chrome version, and Lighthouse version.\n  `,
  `May ${log.green}Lighthouse${log.reset} ${log.bold}report this data to aid in improving the tool?`,
].join('');

async function prompt() {
  if (!process.stdout.isTTY || process.env.CI) {
    // Default non-interactive sessions to false
    return false;
  }

  let timeout: NodeJS.Timer;

  const prompt = inquirer.prompt([
    {
      type: 'confirm',
      name: 'isErrorReportingEnabled',
      default: false,
      message: MESSAGE,
    },
  ]);

  const timeoutPromise = new Promise((resolve: (a: boolean) => {}) => {
    timeout = setTimeout(() => {
      prompt.ui.close();
      process.stdout.write('\n');
      log.warn('CLI', 'No response to error logging preference, errors will not be reported.');
      resolve(false);
    }, MAXIMUM_WAIT_TIME);
  });

  return Promise.race([
    prompt.then((result: {isErrorReportingEnabled: boolean}) => {
      clearTimeout(timeout);
      return result.isErrorReportingEnabled;
    }),
    timeoutPromise,
  ]);
}

export async function askPermission() {
  const configstore = new Configstore('lighthouse');
  let isErrorReportingEnabled = configstore.get('isErrorReportingEnabled');
  if (typeof isErrorReportingEnabled === 'boolean') {
    return isErrorReportingEnabled;
  }

  isErrorReportingEnabled = await prompt();
  configstore.set('isErrorReportingEnabled', isErrorReportingEnabled);
  return isErrorReportingEnabled;
}

export function isDev() {
  return existsSync(joinPath(__dirname, '../.git'));
}
