// 从模板里把中文文案抠出来，写进 tools/site/locales/zh.json。
//
//   node tools/site/extract.mjs           # 补齐 zh.json 里模板里有的那些键
//   node tools/site/extract.mjs --check   # 只比对
//
// 为什么有这一个：中文是原文、是模板里的默认值，zh.json 是从它抄下来的，抄错一处
// 就会悄悄把界面文案改掉。改中文文案改模板，跑一遍这个，zh.json 跟上。
// JS 里 T('key') 用到、模板里没有对应元素的键（比如「整节，共 3 条」）这个脚本补不出来，
// 第一次跑会列出来，手写进 zh.json，之后脚本只更新它能抠到的那部分，不会动。
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CHECK = process.argv.includes('--check');
const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const template = read('tools/site/page.template.html');
const zhPath = 'tools/site/locales/zh.json';
const zh = JSON.parse(read(zhPath));

const TOKENS = /<[^>]*>|[^<]+/g;
const toks = template.match(TOKENS) ?? [];
const found = new Map();
const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
};

// data-i18n-block 的内容由 build.mjs 生成，模板里那几行只是给人看的，不算文案
const isBlock = tag => /\bdata-i18n-block=/.test(tag);

for (let i = 0; i < toks.length; i++){
  const tok = toks[i];
  if (!tok.startsWith('<') || isBlock(tok)) continue;
  const m = /^<([a-z0-9]+)\b([^>]*)>/i.exec(tok);
  if (!m) continue;
  const [, tag, attrs] = m;
  const key = /\bdata-i18n="([\w.]+)"/.exec(attrs);
  if (key){
    // 内文可能有 <b> 这类行内标签，整段当文案；HTML 实体原样留着
    let depth = 0, inner = [];
    for (let j = i + 1; j < toks.length; j++){
      const t = toks[j];
      if (t.startsWith('</')){
        if (new RegExp(`^</${tag}\\s*>$`, 'i').test(t)){ if (depth === 0) break; depth--; }
        else if (new RegExp(`^</${tag}\\b`, 'i').test(t)) depth--;
      } else if (new RegExp(`^<${tag}\\b`, 'i').test(t)) depth++;
      inner.push(t);
    }
    const text = inner.join('').trim();
    if (!text) throw new Error(`模板里 data-i18n="${key[1]}" 那处是空的`);
    put(key[1], text);
  }
  for (const [re, i] of [[/data-i18n-attr="([^"]+)"/, 1], [/data-i18n-attr2="([^"]+)"/, 2]]){
    const am = re.exec(attrs);
    if (!am) continue;
    for (const pair of am[1].split(';')){
      const [name, key] = pair.split(':');
      const value = attr(tok, name);
      if (value === null) throw new Error(`模板里 data-i18n-attr="${am[1]}" 这处的 ${name} 属性没写出来`);
      put(key, value, name);
    }
  }
  const cont = /\bdata-i18n-content="([\w.]+)"/.exec(attrs);
  if (cont){
    const value = attr(tok, 'content');
    if (value === null) throw new Error(`模板里 data-i18n-content="${cont[1]}" 这处的 content 没写出来`);
    put(cont[1], value);
  }
}

// 同一个键在模板里出现多次，文案必须一样（data-i18n-attr2 和 data-i18n 复用同一处的情况除外）
function put(key, text, from = 'data-i18n'){
  if (from === 'data-i18n-attr2') return;   // 跟 data-i18n 指向同一处，中文以那处为准
  if (found.has(key) && found.get(key) !== text)
    throw new Error(`模板里 ${key} 出现了两处不一样的中文：「${found.get(key)}」和「${text}」`);
  found.set(key, text);
}

const missing = [];
for (const [k, v] of found){
  if (zh.strings[k] === v) continue;
  zh.strings[k] = v;
}

// 模板里 T('key') 用到但抠不到的键：原来有就留着，没有就列出来
// T('cost.' + dim + '.' + k) 这种拼出来的键抠不到「cost.」本身，跳过（真正的键在动态表里）
for (const m of template.matchAll(/\bT\('([\w.]+)'/g)){
  if (m[1].endsWith('.') || m[1] === 'key') continue;   // 'key' 是 T() 自己报错时回显的那句
  if (!found.has(m[1]) && zh.strings[m[1]] === undefined) missing.push(m[1]);
}
const dynamic = ['ratio.top', 'ratio.high', 'ratio.mid', 'gain.large', 'gain.medium', 'gain.small',
  'cost.money.0', 'cost.money.few', 'cost.money.much', 'cost.time.few', 'cost.time.mid', 'cost.time.much',
  'cost.will.no', 'cost.will.some', 'cost.will.lots'];
for (const k of dynamic) if (!found.has(k) && zh.strings[k] === undefined) missing.push(k);

// 按键名排序写回，读起来顺，也好 diff
const ordered = Object.fromEntries(Object.keys(zh.strings).sort().map(k => [k, zh.strings[k]]));
const text = JSON.stringify({ ...zh, strings: ordered }, null, 2) + '\n';

if (CHECK){
  if (read(zhPath) === text){ console.log('zh.json 检查通过'); process.exit(0); }
  console.log('zh.json 和模板里的中文对不上。本地跑 node tools/site/extract.mjs 然后提交。');
  process.exit(1);
}

writeFileSync(resolve(ROOT, zhPath), text);
console.log(`已更新 ${zhPath}：${found.size} 个键从模板取到中文，共 ${Object.keys(ordered).length} 个键`);
if (missing.length) console.log(`\n还差 ${missing.length} 个键，模板里抠不到（JS 里拼出来的或只在字典里），手写进 zh.json：\n  ${missing.join('\n  ')}`);