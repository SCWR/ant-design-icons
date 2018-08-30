import fs = require('fs-extra');
import path = require('path');
import { environment } from '../build/env';
import { build } from '../build/generateIcons';
import { Environment } from '../build/typings';

describe.skip('build/generateIcon.ts', () => {
  const env: any = {
    paths: {
      SVG_DIR: path.resolve(__dirname, './root/svg'),
      ICON_TEMPLATE: path.resolve(
        __dirname,
        '../build/templates/icon.ts.template'
      ),
      INDEX_TEMPLATE: path.resolve(
        __dirname,
        '../build/templates/index.ts.template'
      ),
      MANIFEST_TEMPLATE: path.resolve(
        __dirname,
        '../build/templates/manifest.ts.template'
      ),
      TWO_TONE_ICON_TEMPLATE: path.resolve(
        __dirname,
        '../build/templates/twoToneIcon.ts.template'
      ),
      MAP_NAME_TO_IDENTIFIER_TEMPLATE: path.resolve(
        __dirname,
        '../build/templates/mapNameToIdentifier.ts.template'
      ),
      MANIFEST_OUTPUT: path.resolve(__dirname, './root/src/manifest.ts'),
      ICON_OUTPUT_DIR: path.resolve(__dirname, './root/src/'),
      THEME_FILL_OUTPUT: path.resolve(__dirname, './root/src/fill/*.ts'),
      THEME_OUTLINE_OUTPUT: path.resolve(__dirname, './root/src/outline/*.ts'),
      THEME_TWO_TONE_OUTPUT: path.resolve(__dirname, './root/src/twotone/*.ts'),
      INDEX_OUTPUT: path.resolve(__dirname, './root/src/index.ts'),
      MAP_NAME_TO_IDENTIFIER_OUTPUT: path.resolve(
        __dirname,
        './root/src/mapNameToIdentifier.ts'
      )
    },
    base: path.resolve(__dirname, './'),
    options: {
      svgo: environment.options.svgo,
      prettier: environment.options.prettier
    }
  };
  const closePath =
    'M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.' +
    '7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-' +
    '5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.' +
    '9 824.9c-4.4 5.2-.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.' +
    '3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.' +
    '8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z';
  it('should work.', async () => {
    await build(env);
    const outlineString = await fs.readFile(
      `${env.paths.ICON_OUTPUT_DIR}/outline/CloseOutline.ts`,
      'utf8'
    );
    expect(outlineString).toContain(closePath);
  });
});
