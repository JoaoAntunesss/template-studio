/**
 * Cloud Functions (precisam do plano Blaze do Firebase — normalmente 0€/mês com este uso).
 * - avisoNovaMarcacao: quando entra uma marcação pelo site, avisa a dona no WhatsApp (CallMeBot).
 * - resumoDiario: todos os dias à hora definida em loja.js, envia o resumo do dia e de amanhã.
 * - resumoAgora: o mesmo resumo a pedido (só para administradores autenticados).
 * A chave do CallMeBot fica guardada como segredo:  firebase functions:secrets:set CALLMEBOT_KEY
 */
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const LOJA = require("./loja.json");

admin.initializeApp();
const CALLMEBOT_KEY = defineSecret("CALLMEBOT_KEY");
const DONO_TELEFONE = defineString("DONO_TELEFONE");

async function whatsapp(texto) {
  const tel = String(DONO_TELEFONE.value() || "").replace(/\D/g, "");
  const key = CALLMEBOT_KEY.value();
  if (!tel || !key) return;
  const num = tel.length === 9 ? LOJA.indicativo + tel : tel;
  const url = `https://api.callmebot.com/whatsapp.php?phone=%2B${num}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(key)}`;
  const r = await fetch(url);
  if (!r.ok) console.error("CallMeBot falhou", r.status);
}

const nomeProf = (id) => (LOJA.equipa && LOJA.equipa[id]) || id || "";
const eur = (v) => (Number(v) || 0).toFixed(2) + "€";
const isVoucher = (e) => e === "Voucher" || e === "Odisseias";
const isVoucherPago = (e) => e === "Voucher Pago" || e === "Odisseias Pago";
function isoNoFuso(d) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LOJA.fuso, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

exports.avisoNovaMarcacao = onValueCreated(
  { ref: "/reservas/{id}", region: LOJA.regiaoBD, secrets: [CALLMEBOT_KEY] },
  async (event) => {
    const r = event.data.val();
    if (!r || r.pagamento === "Manual") return; // as manuais foram feitas pela própria dona
    const texto = `✨ Nova marcação (site)!\nCliente: ${r.clienteNome}${r.clienteNif && r.clienteNif !== "Consumidor Final" ? `\nNIF: ${r.clienteNif}` : ""}\nTel: ${r.clienteTelemovel}\nServiço: ${r.servicoNome} (${eur(r.preco)})${r.prof ? `\nCom: ${nomeProf(r.prof)}` : ""}\nPagamento: ${r.pagamento}\nDia: ${r.diaTextoVisual} às ${r.hora}`;
    await admin.database().ref("notificacoes").push({
      texto: `Nova marcação de ${r.clienteNome} (${r.servicoNome} - ${eur(r.preco)}) para ${r.diaTextoVisual} às ${r.hora}`,
      data: new Date().toISOString(),
    });
    await whatsapp(texto);
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
  { schedule: `${+mm} ${+hh} * * *`, timeZone: LOJA.fuso, region: LOJA.regiaoBD, secrets: [CALLMEBOT_KEY] },
  async () => { await whatsapp(await montarResumo()); }
);

exports.resumoAgora = onCall({ region: LOJA.regiaoBD, secrets: [CALLMEBOT_KEY] }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sem sessão.");
  const ok = (await admin.database().ref(`admins/${req.auth.uid}`).once("value")).val() === true;
  if (!ok) throw new HttpsError("permission-denied", "Sem permissão.");
  const t = await montarResumo();
  await whatsapp(t);
  return { enviado: true };
});
