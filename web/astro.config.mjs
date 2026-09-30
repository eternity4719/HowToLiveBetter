// Astro 配置。
//
// 两件事和「Astro 默认行为」不一样，都是被这个仓库的既有结构逼出来的：
//
// ① 站点挂在子路径 /HowToLiveBetter/ 下，不是域名根。Pages 发的是
//    https://<user>.github.io/<repo>/，base 必须跟着，否则引用的 CSS/JS/图片全是 404。
//
// ② 正文不放进 src/content/，就地读仓库里那几份 book/*.md。
//    tools/ 下六套构建（epub、pdf、离线单文件）和五个检查脚本
//    （check-refs、check-plain、sync-stats、i18n/check、site/build）全都按
//    book/NN-*.md 这个路径读正文，挪进 src/content/ 等于把六套一起弄断。
//    所以内容集合用 glob loader 指回原来的目录（见 src/content.config.ts）：
//    一份内容，两边读，各读各的。
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Astro 构建会把 web/src/lib 和 tools/site/build.mjs 打包，
// 打包后 import.meta.url 指到构建缓存，那两处按文件位置算仓库根就算偏了。
// 这里先把仓库根钉死，后面它们都按这个来（直接跑 node/tsx 时不用这个变量）。
process.env.HOWTOLIVEBETTER_ROOT ??= fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  site: 'https://streamentry.github.io',
  base: '/HowToLiveBetter',
  // 内容在仓库根，构建在 web/；astro 只看 web/ 里的东西，正文靠内容集合读出去
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  build: {
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
