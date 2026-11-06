/**
 * Cloud Functions (precisam do plano Blaze do Firebase — normalmente 0€/mês com este uso).
 * - avisoNovaMarcacao: quando entra uma marcação pelo site, avisa a dona no Telegram.
 * - resumoDiario: todos os dias à hora definida em loja.js, envia o resumo do dia e de amanhã.
 * - resumoAgora: o mesmo resumo a pedido (só para administradores autenticados).
 * O token do bot e o chat da dona ficam como segredos:  firebase functions:secrets:set TELEGRAM_TOKEN  e  TELEGRAM_CHAT
 */
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const LOJA = require("./loja.json");

admin.initializeApp();
const TELEGRAM_TOKEN = defineSecret("TELEGRAM_TOKEN");
const TELEGRAM_CHAT = defineSecret("TELEGRAM_CHAT");

async function avisar(texto) { // envia para o Telegram da dona
  const token = TELEGRAM_TOKEN.value(), chat = TELEGRAM_CHAT.value();
  if (!token || !chat) return;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: texto, disable_web_page_preview: true }),
  });
  if (!r.ok) console.error("Telegram falhou", r.status);
}

const nomeProf = (id) => (LOJA.equipa && LOJA.equipa[id]) || id || "";
const eur = (v) => (Number(v) || 0).toFixed(2) + "€";
const isVoucher = (e) => e === "Voucher" || e === "Odisseias";
const isVoucherPago = (e) => e === "Voucher Pago" || e === "Odisseias Pago";
function isoNoFuso(d) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LOJA.fuso, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

exports.avisoNovaMarcacao = onValueCreated(
  { ref: "/reservas/{id}", region: LOJA.regiaoBD, secrets: [TELEGRAM_TOKEN, TELEGRAM_CHAT] },
  async (event) => {
    const r = event.data.val();
    if (!r || r.pagamento === "Manual") return; // as manuais foram feitas pela própria dona
    const texto = `✨ Nova marcação (site)!\nCliente: ${r.clienteNome}${r.clienteNif && r.clienteNif !== "Consumidor Final" ? `\nNIF: ${r.clienteNif}` : ""}\nTel: ${r.clienteTelemovel}\nServiço: ${r.servicoNome} (${eur(r.preco)})${r.prof ? `\nCom: ${nomeProf(r.prof)}` : ""}\nPagamento: ${r.pagamento}\nDia: ${r.diaTextoVisual} às ${r.hora}`;
    await admin.database().ref("notificacoes").push({
      texto: `Nova marcação de ${r.clienteNome} (${r.servicoNome} - ${eur(r.preco)}) para ${r.diaTextoVisual} às ${r.hora}`,
      data: new Date().toISOString(),
    });
    await avisar(texto);
  }
);

async function montarResumo() {
  const agora = new Date();
  const hoje = isoNoFuso(agora);
  const amanha = isoNoFuso(new Date(agora.getTime() + 86400000));
  const snap = await admin.database().ref("reservas").orderByChild("dataExata").startAt(hoje).endAt(amanha).once("value");
  let fat = 0, nHoje = 0;
  const listaAmanha = [];
  snap.forEach((c) => {
    const r = c.val();
    if (r.status === "noshow") return;
    if (r.dataExata === hoje) {
      nHoje++;
      fat += isVoucher(r.estadoPagamento) ? 0 : isVoucherPago(r.estadoPagamento) ? Number(r.precoLimpo) || 0 : Number(r.preco) || 0;
    } else if (r.dataExata === amanha) listaAmanha.push(r);
  });
  listaAmanha.sort((a, b) => a.hora.localeCompare(b.hora));
  const vis = (d) => d.split("-").reverse().join("/");
  let t = `👑 *Resumo do Dia - ${LOJA.nome}*\n\n✅ *Hoje (${vis(hoje)}):*\nServiços realizados: ${nHoje}\nFaturação estimada: ${eur(fat)}\n\n📅 *Agenda de Amanhã (${vis(amanha)}):*\n`;
  t += listaAmanha.length ? listaAmanha.map((r) => `🕒 ${r.hora} - ${r.clienteNome} (${r.servicoNome})${r.prof ? " · " + nomeProf(r.prof) : ""}`).join("\n") : "Sem marcações agendadas para amanhã.";
  t += `\n\nBom descanso! ✨`;
  return t;
}

const [hh, mm] = (LOJA.resumoDiario || "19:30").split(":");
exports.resumoDiario = onSchedule(
  { schedule: `${+mm} ${+hh} * * *`, timeZone: LOJA.fuso, region: LOJA.regiaoBD, secrets: [TELEGRAM_TOKEN, TELEGRAM_CHAT] },
  async () => { await avisar(await montarResumo()); }
);

exports.resumoAgora = onCall({ region: LOJA.regiaoBD, secrets: [TELEGRAM_TOKEN, TELEGRAM_CHAT] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sem sessão.");
  const ok = (await admin.database().ref(`admins/${req.auth.uid}`).once("value")).val() === true;
  if (!ok) throw new HttpsError("permission-denied", "Sem permissão.");
  const t = await montarResumo();
  await avisar(t);
  return { enviado: true };
});
