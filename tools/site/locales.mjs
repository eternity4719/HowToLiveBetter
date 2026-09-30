// 语言配置。tools/site/build.mjs 生成页面，tools/i18n/check.mjs 校译文，都从这里读同一份。
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

export const LOCALES = JSON.parse(read('tools/site/locales.json'));
export const DEFAULT_LOCALE = LOCALES.find(l => l.default)?.code ?? LOCALES[0].code;
export const SOURCE = LOCALES.find(l => l.source) ?? LOCALES.find(l => l.code === 'zh');

export function locale(code) {
  const l = LOCALES.find(x => x.code === code);
  if (!l) throw new Error(`没有语言 ${code}，tools/site/locales.json 里只有 ${LOCALES.map(x => x.code).join('、')}`);
  return l;
}
export const LOCALE = locale;

// 字典：界面文案 + 认正文用的标记
export function strings(code) {
  const raw = JSON.parse(read(`tools/site/locales/${code}.json`));
  if (!raw.strings) throw new Error(`locales/${code}.json 里没有 strings`);
  return raw;
}

/** 语言目录，末尾带斜杠：en/、vi/、zh/ */
export const dir = code => locale(code).dir;
/** 正文所在的仓库根相对目录，末尾无斜杠：zh 是 ''（就在根上），en 是 'en' */
export const contentDir = code => locale(code).contentDir;
/** 浏览器那边的相对根：zh 是 ../，en/vi 是 ./。给页面里的 fetch 和相对链接用 */
export const base = code => locale(code).contentBase;