// Gera os ficheiros que dependem de loja.js:  node scripts/nova-loja.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path';
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(raiz, 'public/loja.js'), 'utf8'), ctx);
const L = ctx.window.LOJA;
const w = (f, o) => { fs.writeFileSync(path.join(raiz, f), JSON.stringify(o, null, 2) + '\n'); console.log('✔', f); };
const tipo = L.icone.endsWith('.svg') ? 'image/svg+xml' : L.icone.endsWith('.png') ? 'image/png' : 'image/jpeg';
const icons = [{ src: L.icone, sizes: L.icone.endsWith('.svg') ? 'any' : '512x512', type: tipo, purpose: 'any' }];
w('public/manifest.json', { name: L.nome, short_name: L.nomeCurto || L.nome, description: L.descricao, start_url: './index.html', display: 'standalone', background_color: L.cores.fundo, theme_color: L.cores.destaque, icons });
w('public/admin-manifest.json', { name: `Painel ${L.nome}`, short_name: `Painel ${L.nomeCurto || L.nome}`, start_url: './admin.html', display: 'standalone', background_color: L.cores.painelFundo || L.cores.fundo, theme_color: L.cores.texto, icons });
w('functions/loja.json', { nome: L.nome, indicativo: L.indicativo, fuso: L.fuso, regiaoBD: L.regiaoBD, resumoDiario: L.resumoDiario, equipa: Object.fromEntries((L.equipa || []).map(p => [p.id, p.nome])) });
if ((L.equipa || []).length) console.log(`ℹ Modo equipa: ${L.equipa.map(p => p.nome).join(', ')}. Dê acesso a cada uma no painel, em "Acessos da equipa".`);
if (L.firebase.projectId) w('.firebaserc', { projects: { default: L.firebase.projectId } });
else console.log('ℹ firebase.projectId vazio — o site fica em MODO DEMONSTRAÇÃO.');
const nomes = new Set(); L.servicos.forEach(s => { if (nomes.has(s.nome)) console.warn('⚠ serviço repetido:', s.nome); nomes.add(s.nome); });
