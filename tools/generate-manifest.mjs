// tools/generate-manifest.mjs
import { readdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path ke folder modules dan file output
const MODULES_DIR = join(__dirname, '..', 'modules');
const OUTPUT_FILE = join(__dirname, '..', 'manifest.json');

console.log('🔍 Membaca daftar file di folder /modules...');

try {
    // Baca semua isi folder modules
    const files = await readdir(MODULES_DIR);

    // Filter hanya file .js, tambahkan prefix "modules/", urutkan alfabetis
    const jsFiles = files
        .filter(file => file.endsWith('.js'))
        .map(file => `modules/${file}`)  // ← INI YANG DITAMBAHKAN
        .sort();

    // Bangun objek manifest
    const manifest = {
        modules: jsFiles
    };

    // Tulis ke manifest.json dengan pretty print (indent 2)
    await writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

    console.log(`✅ manifest.json berhasil dibuat!`);
    console.log(`📁 Total modul: ${jsFiles.length}`);
    jsFiles.forEach(file => console.log(`  - ${file}`));

} catch (err) {
    if (err.code === 'ENOENT') {
        console.error('❌ Folder /modules tidak ditemukan. Pastikan struktur direktori benar.');
    } else {
        console.error('❌ Gagal membuat manifest.json:', err.message);
    }
    process.exit(1);
}