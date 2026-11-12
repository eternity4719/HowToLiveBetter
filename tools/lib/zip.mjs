// 自己打 zip：EPUB 和 Anki 牌组两套构建共用。
// EPUB 要求 mimetype 第一个且不压缩，通用 zip 库不一定保证，所以每个文件可以单独指定 store。
import { deflateRawSync } from 'node:zlib';

const crcTable = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = buf => {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

// files: [{ name, data: Buffer, store?: true }]
// unix：把「由哪个系统打的包」标成 Unix。文件名本来就按 UTF-8 写并打了 UTF-8 标志，多数工具认这个标志；
// 但不认它的老 unzip（Git Bash 自带的那个）见到默认的 DOS 标记，会把文件名当 DOS 代码页再转一遍，
// 中文全成乱码，标成 Unix 它就原样照搬。要给人解压出中文文件名的包才开，EPUB 和 Anki 不解压，用不着。
export function zip(files, now = new Date(), { unix = false } = {}) {
  const madeBy = unix ? (3 << 8) | 20 : 20;
  const attrs = unix ? (0o100644 << 16) >>> 0 : 0;
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name);
    const data = f.store ? f.data : deflateRawSync(f.data, { level: 9 });
    const method = f.store ? 0 : 8;
    const crc = crc32(f.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(madeBy, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(f.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(attrs, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, data);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
