import assert = require('assert');
import chalk from 'chalk';
import fs = require('fs-extra');
import _ = require('lodash');
import path = require('path');
import rimraf = require('rimraf');
import { AbstractNode, Environment, Node, ThemeType } from '../typings';

export function normalizeNode(node: Node, debugName?: string): AbstractNode {
  const tag = node.tagName;
  if (!tag) {
    throw new TypeError(`${debugName} Element should have no no-tag node`);
  }
  const attrs = node.attrs.reduce((acc, { name, value }) => {
    Object.defineProperty(acc, name, { value, enumerable: true });
    return acc;
  }, {});
  const children = node.childNodes.map((child) =>
    normalizeNode(child, debugName)
  );
  return {
    tag,
    attrs,
    children
  };
}

/**
 * Parse the node generated by parse5 into the abstract tree.
 * @param node the node that need parsing.
 * @param debugName debug name, used in assert statement.
 */
export function generateAbstractTree(
  node: Node,
  debugName?: string
): AbstractNode {
  assert(node, debugName);
  assert(node.tagName === 'svg', debugName);
  const viewBox = node.attrs.find(({ name }) => name === 'viewBox')!;
  assert(viewBox, debugName);
  const size: number[] = viewBox!.value
    .split(' ')
    .slice(2)
    .map((str) => Number.parseInt(str, 10));
  assert(
    size.length === 2,
    `The size tuple should be [ width, height ], but got [ ${size[0]}, ${
      size[1]
    } ] [${debugName}]`
  );
  const oneLevelPathNodes = node.childNodes.filter(
    ({ nodeName, childNodes }) =>
      nodeName !== 'style' && childNodes.length === 0
  );
  assert(oneLevelPathNodes.length >= 1, debugName);

  return normalizeNode(node, debugName);
}

export const log = {
  info(message: string) {
    return console.log(chalk.green(`🌟 [Generate] ${message}`));
  },
  notice(message: string) {
    return console.log(chalk.blueBright(`🌟 [Notice] ${message}`));
  }
};

export function getIdentifier(identifier: string, theme: ThemeType) {
  switch (theme) {
    case 'fill':
      return `${identifier}Fill`;
    case 'outline':
      return `${identifier}Outline`;
    case 'twotone':
      return `${identifier}TwoTone`;
    default:
      throw new TypeError(
        `Unknown theme type: ${theme}, identifier: ${identifier}`
      );
  }
}

export function withSuffix(name: string, theme: ThemeType) {
  switch (theme) {
    case 'fill':
      return `${name}-fill`;
    case 'outline':
      return `${name}-o`;
    case 'twotone':
      return `${name}-twotone`;
    default:
      throw new TypeError(`Unknown theme type: ${theme}, name: ${name}`);
  }
}

export function getRollbackTheme(
  env: Environment,
  kebabCaseName: string,
  rollbackList: ThemeType[]
) {
  const paths = rollbackList.map((theme) => ({
    theme,
    url: path.resolve(env.paths.SVG_DIR, theme, `${kebabCaseName}.svg`)
  }));
  for (const { theme, url } of paths) {
    try {
      fs.accessSync(url);
      return theme;
    } catch (error) {
      // noop
    }
  }
  throw new Error(`There is no SVG of the icon: ${kebabCaseName}`);
}

/**
 * Clear by using 'rimraf'.
 */
export async function clear(env: Environment) {
  log.notice(`Clear folders.`);
  return Promise.all(
    (Object.keys(env.paths) as Array<keyof typeof env.paths>)
      .filter((key) => key.endsWith('OUTPUT')) // DO NOT DELETE THIS LINE!!!
      .map((key) => {
        // This is evil. Make sure you just delete the OUTPUT.
        log.notice(`Delete ${path.relative(env.base, env.paths[key])}.`);
        return new Promise((resolve) => rimraf(env.paths[key], resolve));
      })
  );
}

export function isAccessable(url: string) {
  let accessable = false;
  try {
    fs.accessSync(url);
    accessable = true;
  } catch (error) {
    accessable = false;
  }
  return accessable;
}

export function theseShouldBeWithTheme(
  basicNames: string[],
  theme: ThemeType,
  isKebabCase?: boolean
) {
  return basicNames
    .map((basicName) => ({
      key: basicName,
      value: isKebabCase
        ? withSuffix(basicName, theme)
        : getIdentifier(_.upperFirst(_.camelCase(basicName)), theme)
    }))
    .reduce<{ [key: string]: string }>((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
}
