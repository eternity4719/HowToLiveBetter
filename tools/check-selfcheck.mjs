// 用真实题目和正文检查年龄门槛、旧答案迁移及结果里的适用条件。
// node tools/check-selfcheck.mjs（零依赖，不写文件）
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const html = read('selfcheck.html');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
assert.ok(script, '找不到自查页脚本');
const parts = Object.fromEntries(readdirSync(new URL('book/', root))
  .filter(f => f.endsWith('.md')).map(f => [`book/${f}`, read(`book/${f}`)]));
const elements = new Map();
const element = id => {
  if (!elements.has(id)) elements.set(id, {
    innerHTML:'', textContent:'', value:'', hidden:false, removed:false,
    listeners:new Map(),
    addEventListener(type, fn) { this.listeners.set(type, fn); },
    remove() { this.removed = true; },
  });
  return elements.get(id);
};
const warnings = [];
const oldAnswers = {'p:age':'30', 'p:sex':'f', 'p:kid':'n', '2:低钠盐':'n', '1:乙肝两对半':'y'};
const context = vm.createContext({
  window:{__CORPUS__:{readme:read('README.zh.md'), parts}},
  document:{getElementById:element},
  localStorage:{getItem:() => JSON.stringify(oldAnswers), setItem:() => {}},
  location:{protocol:'http:'}, scrollTo:() => {},
  console:{error:message => warnings.push(message)},
});
vm.runInContext(script, context);
await new Promise(resolve => setImmediate(resolve));
assert.equal(element('status').removed, true, element('status').textContent);
assert.deepEqual(warnings, [], '每道题都应能找到正文条目');
const run = code => vm.runInContext(code, context);

assert.equal(run('profileDone()'), false, '旧版30—44岁不能当成实际30岁');
assert.equal(run("ans['2:低钠盐']"), 'n', '更换年龄字段应保留其他答案');
assert.equal(run("ans[qid(GROUPS.flatMap(g => g.qs).find(q => q.key === '乙肝两对半'))]"), undefined,
  '语义改变后的乙肝题不能沿用旧的已做到答案');
for (const age of ['', 'abc', '-1', '121', '39.5']) {
  run(`ans['p:ageYears'] = ${JSON.stringify(age)}`);
  assert.equal(run('profileDone()'), false, `拒绝无效年龄：${age}`);
}
const expected = [
  ['空腹血糖',35], ['乳腺癌筛查',40], ['结直肠癌筛查',45],
  ['带状疱疹疫苗',50], ['流感疫苗',60], ['肺炎球菌疫苗',65], ['骨密度',65],
];
for (const [key, min] of expected) {
  for (const age of [min - 1, min]) {
    run(`ans['p:ageYears'] = '${age}'`);
    assert.equal(run('profileDone()'), true);
    assert.equal(run(`activeQs().some(q => q.key === ${JSON.stringify(key)})`), age >= min,
      `${key}在${age}岁的显示状态`);
  }
}
run("ans['p:ageYears'] = '65'; ans['p:sex'] = 'm'");
assert.equal(run("activeQs().some(q => q.key === '乳腺癌筛查' || q.key === '骨密度')"), false);

// 低钠盐未做到时，结果卡片和复制出去的清单都必须保留肾功能/用药提醒。
run('renderOut()');
for (const output of [element('todo').innerHTML, element('copy-text').value]) {
  assert.match(output, /肾功能不全/);
  assert.match(output, /保钾类药物/);
}
const noteOrder = element('todo').innerHTML;
assert.ok(noteOrder.indexOf('class="caution"') < noteOrder.indexOf('class="human"'),
  '适用条件应先于收益摘要显示');
run("ENTRIES[0].note = '<img src=x onerror=alert(1)>'");
const escaped = run('card(ENTRIES[0], [])');
assert.ok(escaped.includes('&lt;img'));
assert.ok(!escaped.includes('<img'), '备注必须按文本转义');

// 实际触发页面的年龄输入处理器，确认保存与重新出题衔接。
run('renderAsk()');
const profileHtml = element('profile-qs').innerHTML;
element('qs').listeners.get('input')({target:{
  matches:selector => selector === 'input[data-k="p:ageYears"]', value:'40',
}});
assert.equal(run("ans['p:ageYears']"), '40');
assert.equal(element('profile-qs').innerHTML, profileHtml, '输入时不重建基本情况控件');
console.log('自查检查通过：题目引用、7项年龄边界、旧答案迁移、输入校验、备注展示与复制');
