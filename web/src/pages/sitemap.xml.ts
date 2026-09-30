import { sitemapXml } from '../../../tools/site/build.mjs';
export async function GET() {
  return new Response(sitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
