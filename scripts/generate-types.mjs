/**
 * Genera los tipos de la base de datos de forma segura.
 *
 * La CLI devuelve los tipos por stdout, así que una redirección directa
 * (`> archivo`) deja el archivo vacío o con el JSON de error si la API de
 * Supabase falla. Este script captura la salida, la valida y solo entonces
 * reemplaza el archivo anterior.
 *
 * Uso: `pnpm types:gen` (necesita el proyecto vinculado y la CLI en PATH).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'frontend', 'src', 'types', 'database.generated.ts');

const HEADER = `/**
 * Tipos generados desde la base de datos de Supabase (esquema \`public\`).
 *
 * No editar a mano: se regeneran con \`pnpm types:gen\`.
 * Archivo generado: se excluye de ESLint por su formato de salida.
 */
`;

const result = spawnSync('supabase gen types typescript --schema public --remote', {
    cwd: root,
    encoding: 'utf8',
    shell: true,
});

if (result.status !== 0) {
    console.error('No se pudieron generar los tipos. Se conserva el archivo anterior.');
    if (result.stderr) console.error(result.stderr.trim());
    process.exit(result.status ?? 1);
}

if (!result.stdout.includes('export type Database')) {
    console.error('La CLI devolvió una salida inesperada. Se conserva el archivo anterior.');
    process.exit(1);
}

writeFileSync(target, HEADER + result.stdout, 'utf8');
console.log(`Tipos actualizados en ${target}`);
