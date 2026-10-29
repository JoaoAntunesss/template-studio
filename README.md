# Template Studio — site de marcações para salões

Site público + agenda online + painel de gestão + avisos por WhatsApp, para salões de beleza e estéticas.
Cada loja é configurada num só ficheiro: [`public/loja.js`](public/loja.js).

<p><img src="docs/site.png" width="62%"> <img src="docs/whatsapp.png" width="30%"></p>
<img src="docs/painel.png" width="62%">

*Imagens da loja de demonstração "Studio Aurora" (dados fictícios).*

- **Site:** serviços com duração e preço, campanhas, galeria, contactos, agenda com horários livres em tempo real, PWA.
- **Painel:** faturação, gráficos, clientes (CRM), agenda semanal, marcações manuais com repetição, vouchers, preços, bloqueios, notícias.
- **WhatsApp:** aviso a cada nova marcação e resumo diário (Cloud Functions + CallMeBot).
- **Segurança:** login Firebase Auth, dados das clientes privados, agenda pública só com horas ocupadas.

Instruções completas em [LEIA-ME.md](LEIA-ME.md).
