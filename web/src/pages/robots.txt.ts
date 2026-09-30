import { robotsTxt } from '../../../tools/site/build.mjs';
export async function GET() {
  return new Response(robotsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
