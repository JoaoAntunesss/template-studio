# Template — Site de marcações para salões / estéticas

Site público + painel de gestão + avisos por WhatsApp, tudo num só projeto Firebase por cliente.
**Para cada loja nova só se muda `public/loja.js` e as imagens em `public/img/`.**

## Ver a demonstração (sem Firebase)
Com `firebase.apiKey` vazio em `loja.js`, o site corre em **modo demonstração** (loja "Studio Aurora" e clientes fictícios, guardados só no navegador):

```
cd public && python3 -m http.server 8000
```
Abre http://localhost:8000 (site) e http://localhost:8000/admin.html (painel, clica em "Entrar").

## Nova loja, passo a passo
1. Copia esta pasta inteira com o nome da loja.
2. Edita `public/loja.js`: nome, cores, fontes, textos, morada, telefone, redes, horário, serviços (duração em minutos), pagamentos, vouchers, mensagens.
3. Põe as fotos em `public/img/` (logo, ícone quadrado, hero, galeria, foto da loja) e acerta os caminhos em `loja.js`.
4. Na [Consola Firebase](https://console.firebase.google.com): cria um projeto → **Realtime Database** (região europe-west1) → **Authentication** (ativa Email/Password e/ou Google) → adiciona uma **App Web** e copia a config para `loja.js > firebase`.
5. Em Authentication cria a conta da dona (ou ela entra uma vez com Google). Copia o **UID** dela e, na Realtime Database, cria: `admins / <UID> = true` (booleano).
   O próprio painel mostra o UID se a conta ainda não tiver acesso.
6. `node scripts/nova-loja.mjs` (gera manifestos, `.firebaserc` e `functions/loja.json`).
7. `firebase deploy --only hosting,database`
8. Domínio próprio: Hosting → Adicionar domínio personalizado.

### Avisos por WhatsApp (opcional — precisa do plano Blaze, na prática 0 €)
1. A dona ativa o CallMeBot no WhatsApp dela e recebe a chave.
2. `cp functions/.env.example functions/.env` e põe o telemóvel dela.
3. `firebase functions:secrets:set CALLMEBOT_KEY` (cola a chave — fica fora do site público).
4. `cd functions && npm install && cd .. && firebase deploy --only functions`

Passa a receber: aviso a cada marcação feita no site + resumo diário (hora em `loja.js > resumoDiario`).

### Email de confirmação à cliente (opcional)
Cria conta no EmailJS, um serviço e um template (variáveis: `cliente_nome, servico_nome, dia, hora, preco, pagamento, loja`), e preenche `loja.js > emailjs`. No EmailJS, restringe os domínios autorizados ao domínio da loja.

## Funcionalidades
**Site:** barra de notícias, banner de campanha com desconto (geral ou por serviço), serviços por categoria com duração e preço, galeria, morada/contactos/horário, agenda semanal com horários livres em tempo real, marcação com nome/telemóvel/email/NIF/pagamento, link para Google Calendar, botão WhatsApp, instalável como app (PWA).

**Painel:** faturação limpa por mês, nº de marcações, serviço mais popular, gráficos mensal e semanal, CRM de clientes (pesquisa, ordenação, exportar Excel), agenda semanal com nomes, confirmações WhatsApp pendentes (individual ou todas), marcações manuais múltiplas com repetição (semanal/quinzenal/mensal) e pesquisa automática da cliente pelo telemóvel, vouchers (ex.: Odisseias) com valor líquido, alterar/repor preços, bloquear dias ou horas, barra de notícias, campanhas, lista de marcações com Pago / Faltou / Eliminar.

## Segurança (diferente do site antigo)
- Painel protegido por **Firebase Auth** + lista `admins` nas regras — não há palavra-passe no código.
- Os dados das clientes (`reservas`) **só são lidos pela dona**. O site público só vê `ocupacao` (que horas estão ocupadas, sem nomes).
- O público só pode **criar** marcações (não altera nem apaga), com validação de campos; a reserva de horário é atómica, por isso duas pessoas não conseguem marcar a mesma hora.
- A chave do CallMeBot fica num segredo das Functions; não há funções públicas abertas.
- Os textos das clientes são escapados antes de aparecer no painel.

## Migrar uma loja antiga (ex.: dados do site da Xana)
Importa o JSON antigo para a nova base de dados (Consola → Realtime Database → ⋮ → Importar), cria `admins/<UID>` e no painel carrega em **Manutenção → Reconstruir ocupação**. Os estados "Odisseias"/"Odisseias Pago" antigos são reconhecidos.

## Salões com equipa (várias profissionais)
O mesmo template serve para os dois casos:
- **Uma pessoa:** em `loja.js`, `equipa: []`. Tudo funciona como até aqui.
- **Equipa:** copie `exemplos/loja-equipa.js` para `public/loja.js` e preencha `equipa`. Cada pessoa tem:
  - `id` e `nome`;
  - `cargo` (o que aparece por baixo do nome no site);
  - `foto` (quadrada, em `img/equipa/`);
  - `cor` (a cor dela na agenda do painel);
  - `servicos` (os serviços que faz, ou `["*"]` para todos);
  - `horario` (opcional; sem ele, usa o horário do salão).

O que muda com equipa:
- **No site:**
  - Há uma secção "A nossa equipa", com as fotos.
  - Na marcação aparece o passo "Com quem": a cliente escolhe a pessoa ou "Qualquer uma", e nesse caso fica com a primeira livre.
  - Cada pessoa só aparece nos serviços que faz e tem a sua própria agenda.
- **Painel da dona:**
  - A agenda mostra todas as pessoas (cada uma com a sua cor) ou uma de cada vez.
  - A tabela "Por colaboradora" mostra as marcações, as faltas e a faturação de cada uma no mês.
  - Na marcação manual e nos bloqueios escolhe-se a pessoa (por exemplo, para as férias de uma colaboradora).
- **Acessos da equipa:** a dona escreve o email Google de cada colaboradora.
  - Quando a colaboradora entra no painel com esse email, vê **só a sua agenda e as suas marcações**: marcações manuais, WhatsApp, pago ou falta, e as suas férias.
  - Não vê a faturação, os clientes das colegas, os preços nem as campanhas.
  - Isto é garantido pelas regras da base de dados (`database.rules.json`), não só pelo ecrã.
- **WhatsApp:** os avisos e o resumo diário passam a dizer com quem é cada marcação.

Para experimentar em modo demonstração, use `exemplos/loja-equipa.js` como `loja.js`. No painel, carregue em "Entrar" para ver como a dona, ou escreva `rita@exemplo.pt` no email para ver como a colaboradora Rita.
