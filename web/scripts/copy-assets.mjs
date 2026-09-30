// 构建后把 Pages 要的静态文件拷进 web/dist。
//
// 为什么拷而不是放 web/public：og.png、ads/ 是仓库根的东西，被 README、
// EPUB、离线单文件几套构建共用。复制一份进 web/ 就多一处会过时的地方
// （况且 og.png 每次统计同步都会重截）。构建时从根上拷，源头永远只有一份。
// .nojekyll 也在这里拷：没有它，Pages 会拿 Jekyll 处理一遍，以下划线开头的
// 目录会被忽略——现在没有这种目录，但删了它等于把这道保险也删了。
import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(WEB, '..');
const DIST = resolve(WEB, 'dist');

mkdirSync(DIST, { recursive: true });
copyFileSync(resolve(ROOT, 'og.png'), resolve(DIST, 'og.png'));
cpSync(resolve(ROOT, 'ads'), resolve(DIST, 'ads'), { recursive: true });
copyFileSync(resolve(ROOT, '.nojekyll'), resolve(DIST, '.nojekyll'));
console.log('静态文件已拷进 web/dist：og.png、ads/、.nojekyll');
