/* core.js — partilhado pelo site e pelo painel. Não precisa de ser alterado por loja. */
(function () {
  const L = window.LOJA;
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const DIAS_NOME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const INT = (L.agenda && L.agenda.intervaloMin) || 30;
  const DEMO = !(L.firebase && L.firebase.apiKey);

  const hm = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmtH = t => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');

  // Todas as horas possíveis da semana (da abertura mais cedo ao fecho mais tarde)
  let mn = 24 * 60, mx = 0;
  Object.values(L.agenda.horario).forEach(r => (r || []).forEach(([a, b]) => { mn = Math.min(mn, hm(a)); mx = Math.max(mx, hm(b)); }));
  const HORAS = [];
  for (let t = mn; t + INT <= mx; t += INT) HORAS.push(fmtH(t));

  function aberto(date, hora) {
    const r = L.agenda.horario[DIAS[date.getDay()]];
    if (!r) return false;
    const t = hm(hora);
    return r.some(([a, b]) => t >= hm(a) && t + INT <= hm(b));
  }
  const blocosDe = s => Math.max(1, Math.ceil((s.min || INT) / INT));
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const isoParaData = s => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const visual = s => s.split('-').reverse().join('/');
  const segunda = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() || 7) - 1)); return x; };
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = v => (Number(v) || 0).toFixed(2) + '€';
  const duracao = min => { const h = Math.floor(min / 60), m = min % 60; return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`; };
  const tpl = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const telInt = t => { let n = String(t || '').replace(/\D/g, ''); if (n.length === 9) n = L.indicativo + n; return n; };
  const telValido = t => String(t || '').replace(/\D/g, '').length >= 9;

  // Slots ocupados por uma reserva (hora inicial + blocos)
  function slotsDe(r) {
    const i = HORAS.indexOf(r.hora), out = [];
    for (let k = 0; k < (r.blocos || 1); k++) if (HORAS[i + k]) out.push(HORAS[i + k]);
    return out;
  }

  // ---------- Aspeto (cores e fontes a partir de loja.js) ----------
  function aplicarTema(painel) {
    const c = L.cores, s = document.documentElement.style;
    s.setProperty('--bg-color', painel ? (c.painelFundo || c.fundo) : c.fundo);
    s.setProperty('--text-color', c.texto);
    s.setProperty('--accent-color', c.destaque);
    s.setProperty('--accent-dark', c.destaqueEscuro);
    s.setProperty('--font-title', `'${L.fontes.titulo}', serif`);
    s.setProperty('--font-text', `'${L.fontes.texto}', sans-serif`);
    const f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(L.fontes.titulo) + ':wght@400;600&family=' + encodeURIComponent(L.fontes.texto) + ':wght@300;400;700&display=swap';
    document.head.appendChild(f);
    const tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = painel ? c.texto : c.destaque;
  }

  // =================================================================
  // Base de dados: Firebase a sério, ou uma imitação local (modo demo)
  // =================================================================
  function carregarScript(src) {
    return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  let _db = null, _auth = null;

  async function iniciar(comAuth) {
    if (_db) return;
    if (!DEMO) {
      const v = '10.12.5', b = `https://www.gstatic.com/firebasejs/${v}/`;
      await carregarScript(b + 'firebase-app-compat.js');
      await carregarScript(b + 'firebase-database-compat.js');
      if (comAuth) await carregarScript(b + 'firebase-auth-compat.js');
      firebase.initializeApp(L.firebase);
      _db = firebase.database();
      if (comAuth) _auth = firebase.auth();
      return;
    }
    _db = demoDB();
    _auth = demoAuth();
  }

  // ---- Imitação mínima da Realtime Database (só para demonstração) ----
  function demoDB() {
    const KEY = 'demo-db-' + L.id;
    let tree = null;
    try { tree = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!tree) tree = semente();
    const ouvintes = [];
    const partes = p => (p || '').split('/').filter(Boolean);
    const ler = p => partes(p).reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), tree);
    function escrever(p, v) {
      const ks = partes(p);
      if (!ks.length) { tree = v || {}; return; }
      let o = tree;
      for (let i = 0; i < ks.length - 1; i++) { if (typeof o[ks[i]] !== 'object' || o[ks[i]] === null) o[ks[i]] = {}; o = o[ks[i]]; }
      const last = ks[ks.length - 1];
      if (v === null || v === undefined) delete o[last]; else o[last] = JSON.parse(JSON.stringify(v));
    }
    function guardar() {
      try { localStorage.setItem(KEY, JSON.stringify(tree)); } catch (e) {}
      ouvintes.forEach(l => l.cb(snap(l.p)));
    }
    const snap = p => { const v = ler(p); return { key: partes(p).pop(), val: () => (v === undefined ? null : JSON.parse(JSON.stringify(v))) }; };
    let cont = 0;
    const novaChave = () => '-D' + Date.now().toString(36) + (cont++).toString(36) + Math.random().toString(36).slice(2, 6);
    function ref(p = '') {
      return {
        key: partes(p).pop() || null,
        on(_, cb) { ouvintes.push({ p, cb }); setTimeout(() => cb(snap(p)), 0); },
        once() { return Promise.resolve(snap(p)); },
        set(v) { escrever(p, v); guardar(); return Promise.resolve(); },
        update(o) { Object.keys(o).forEach(k => escrever(p ? p + '/' + k : k, o[k])); guardar(); return Promise.resolve(); },
        remove() { escrever(p, null); guardar(); return Promise.resolve(); },
        push(v) { const r = ref((p ? p + '/' : '') + novaChave()); const pr = v === undefined ? Promise.resolve() : r.set(v); r.then = pr.then.bind(pr); r.catch = pr.catch.bind(pr); return r; }
      };
    }
    return { ref, reset() { try { localStorage.removeItem(KEY); } catch (e) {} tree = semente(); guardar(); } };
  }
  function demoAuth() {
    let user = null, cbs = [];
    const set = u => { user = u; cbs.forEach(c => c(u)); return Promise.resolve({ user: u }); };
    return {
      onAuthStateChanged(cb) { cbs.push(cb); setTimeout(() => cb(user), 0); },
      signInWithEmailAndPassword: () => set({ uid: 'demo', email: 'demo@exemplo.pt' }),
      signInWithPopup: () => set({ uid: 'demo', email: 'demo@exemplo.pt' }),
      signOut: () => set(null)
    };
  }

  // Dados fictícios para a demonstração (nomes e números inventados)
  function semente() {
    const nomes = ['Mariana Costa', 'Inês Lopes', 'Beatriz Sousa', 'Carolina Matos', 'Sofia Ramos', 'Rita Pacheco', 'Joana Pires', 'Catarina Neves', 'Ana Ferraz', 'Leonor Brito', 'Marta Vilar', 'Teresa Gomes', 'Helena Faria', 'Patrícia Melo'];
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const reservas = {}, ocupacao = {};
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    let n = 0;
    for (let dd = -100; dd <= 14; dd++) {
      const d = new Date(hoje); d.setDate(d.getDate() + dd);
      const livres = HORAS.filter(h => aberto(d, h));
      if (!livres.length) continue;
      const qtd = Math.floor(rnd() * 4);
      for (let q = 0; q < qtd; q++) {
        const s = L.servicos[Math.floor(rnd() * L.servicos.length)], bl = blocosDe(s);
        const h = livres[Math.floor(rnd() * livres.length)];
        const r = { hora: h, blocos: bl };
        const sl = slotsDe(r), di = iso(d);
        if (sl.length < bl || sl.some(x => !aberto(d, x) || (ocupacao[di] && ocupacao[di][x]))) continue;
        const ci = Math.floor(rnd() * nomes.length), id = 'demo' + String(n++).padStart(4, '0');
        const passado = dd < 0, vou = L.vouchers.ativo && rnd() < 0.06;
        Object.assign(r, {
          dataExata: di, diaTextoVisual: visual(di), hIndex: HORAS.indexOf(h), servicoNome: s.nome, preco: s.preco,
          clienteNome: nomes[ci], clienteTelemovel: '9100000' + String(10 + ci), clienteEmail: 'N/A', clienteNif: 'Consumidor Final',
          pagamento: L.pagamentos[Math.floor(rnd() * L.pagamentos.length)],
          estadoPagamento: vou ? (passado && rnd() < 0.6 ? 'Voucher Pago' : 'Voucher') : (passado ? 'Já Pago' : 'A Pagar no Dia'),
          status: passado && rnd() < 0.05 ? 'noshow' : 'ativo', dataRegisto: new Date().toISOString(), mensagemEnviada: passado || rnd() < 0.5
        });
        if (r.estadoPagamento === 'Voucher Pago') r.precoLimpo = Math.round(s.preco * 0.7 * 2) / 2;
        reservas[id] = r;
        sl.forEach(x => { (ocupacao[di] = ocupacao[di] || {})[x] = id; });
      }
    }
    return {
      reservas, ocupacao, precos: {}, bloqueios: {},
      config: { noticiasBarra: L.noticiaInicial || '', campanha: { texto: '🌸 Campanha de Primavera', desconto: 10, servicoAlvo: L.servicos[0].nome } }
    };
  }

  window.APP = {
    L, DEMO, HORAS, INT, DIAS_NOME, MESES,
    aberto, blocosDe, iso, isoParaData, visual, segunda, esc, eur, duracao, tpl, telInt, telValido, slotsDe, aplicarTema, iniciar,
    get db() { return _db; }, get auth() { return _auth; }
  };
})();
