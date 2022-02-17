import fs from 'fs';
import path from 'path';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';
import { matcher } from './matcher';
import dataset from './utils/dataset';
import { getLocalIpAddress } from './utils/ip';
export * from './macos/os';
export * from './systemProxy';
import * as pkg from '../../package.json';
import { channelManager } from './socket/socket';

export const test = async (url: string) => {
  const { config } = dataset;
  if (config) {
    const matchResult = _.cloneDeep(matcher(config.rules, url));

    for (const key in matchResult) {
      if (key === 'rule') {
        for (const k in matchResult.rule) {
          if (k === 'regx' && matchResult && matchResult.rule && matchResult.rule[k]) {
            matchResult.rule[k] = matchResult.rule[k].toString();
          }
        }
      }
    }

    return matchResult;
  }

  return {};
}

export const getLocalIp = async() => {
  return getLocalIpAddress();
};

export const getLocalProxyPort = async() => {
  const { config } = dataset;

  return config?.port;
}

export const getProxyConfig = async() => {
  const { config } = dataset;

  return config;
}

export const getConfigFile = () => {
  const { configPath } = dataset;

  return configPath;
};

export const getConfigFileContent = () => {
  const configFilePath = getConfigFile();

  if (configFilePath) {
    const txt = fs.readFileSync(configFilePath, 'utf-8');

    return txt;
  }

  return '';
};

export const getVersion = (): string => {
  return pkg.version;
};

export const setConfigFileContent = (params: {data: string}) => {
  const configFilePath = getConfigFile();
  const { data } = params || {};

  if (configFilePath && data) {
    fs.writeFileSync(configFilePath, data);

    return true;
  }

  return false;
};

export const mapFile = (params: {
  regx: string;
  file: string;
  configFilePath: string;
  content: string;
}) => {
  const { regx, file, configFilePath, content } = params;
  const mockFilePath = `./mock/${file}`;
  const rule = `
config.rules.push({
  regx: '${regx}',
  file: '${mockFilePath}'
});
  `;
  let success = true;
  try {
    mkdirp.sync('./mock');
    fs.writeFileSync(mockFilePath, content);
    const configText = fs.readFileSync(path.resolve(configFilePath), 'utf-8');
    const newConfig = configText.replace('module.exports', `\n${rule}\nmodule.exports`);
    fs.writeFileSync(path.resolve(configFilePath), newConfig);
  } catch(err) {
    success = false;
  }

  return success;
};

export const mapPage = (params: {
  regx: string;
  configFilePath: string;
}) => {
  const { regx, configFilePath } = params;
  const configText = fs.readFileSync(path.resolve(configFilePath), 'utf-8');
  const rule = `
config.rules.push({
  regx: /${regx.replace(/\//g, '\\/')}/,
  debug: true,
});
  `;
  try {
    const newConfig = configText.replace('module.exports', `\n${rule}\nmodule.exports`);
    fs.writeFileSync(path.resolve(configFilePath), newConfig);
  } catch(er) {}
}

export const getDebugTargets = () => {
  return channelManager._targets;
}
