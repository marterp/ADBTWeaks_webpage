import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

mkdirSync('dist', { recursive: true });
for (const file of ['index.html', 'privacy.html', 'style.css', 'ic_launcher.png']) {
  cpSync(file, join('dist', file));
}
rmSync('dist/api', { recursive: true, force: true });
mkdirSync('dist/api', { recursive: true });
cpSync('api/register.js', join('dist', 'api/register.js'));
console.log('Built dist/');
