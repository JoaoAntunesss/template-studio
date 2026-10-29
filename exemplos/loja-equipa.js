/* =====================================================================
   EXEMPLO PARA SALÕES COM EQUIPA — copie para public/loja.js e adapte.
   LOJA.JS — o ÚNICO ficheiro a mudar para cada novo cliente.
   Tudo o resto (site, painel, regras, funções) lê daqui.
   Depois de editar, corre:  node scripts/nova-loja.mjs
   (gera manifest.json, admin-manifest.json, .firebaserc e functions/loja.json)
   ===================================================================== */
window.LOJA = {
  id: "studio-aurora-equipa",                       // identificador curto, sem espaços
  nome: "Studio Aurora",
  nomeCurto: "Aurora",                       // nome na app instalada (PWA)
  slogan: "Beleza & Bem-estar",
  descricao: "Estúdio de beleza e estética — marcações online",

  // ---------- Aspeto ----------
  logo: "img/logo.svg",
  logoClaro: "img/logo-claro.svg",            // opcional: versão branca do logo para o topo (sem ela, o logo vai numa pastilha branca)
  icone: "img/icone.svg",                    // ícone da app (quadrado)
  cores: {
    fundo: "#fbf9f7",
    texto: "#2f2a33",
    destaque: "#b07a8c",                     // botões, preços
    destaqueEscuro: "#8a5a6b",               // títulos, banners
    painelFundo: "#f6f2f4"
  },
  fontes: { titulo: "Playfair Display", texto: "Lato" },   // Google Fonts

  hero: {
    imagem: "img/hero.svg",
    titulo: "A sua beleza começa *aqui*",          // *palavra* fica em itálico de destaque
    subtitulo: "Marque online em segundos e receba a confirmação no WhatsApp."
  },
  noticiaInicial: "✨ Bem-vindo ao Studio Aurora! Consulte os nossos serviços e faça já a sua marcação online.",

  // ---------- Contactos ----------
  morada: ["Rua das Camélias, 120", "4000-000 Porto"],
  mapa: "https://maps.google.com/?q=Rua+das+Camelias+120+Porto",
  telefone: "910000000",                    // aparece no site e no botão WhatsApp
  indicativo: "351",
  redes: [
    { nome: "Instagram", url: "https://www.instagram.com/" },
    { nome: "Facebook", url: "https://www.facebook.com/" }
  ],
  fotoLoja: "img/loja.svg",

  galeria: [
    { src: "img/g1.svg", alt: "Unhas de gel" },
    { src: "img/g2.svg", alt: "Lifting de pestanas" },
    { src: "img/g3.svg", alt: "Massagem" },
    { src: "img/g4.svg", alt: "Design de sobrancelhas" },
    { src: "img/g5.svg", alt: "Limpeza de pele" },
    { src: "img/g6.svg", alt: "Verniz gel" }
  ],
  // Descrição curta opcional por serviço: acrescente  desc: "..."  a cada serviço.

  // ---------- Avaliações (copie as REAIS do Google; nunca invente) ----------
  // nota/total: null para esconder o cartão. lista: [] para esconder a secção.
  avaliacoes: {
    nota: 4.9, total: 120, link: "https://www.google.com/maps",
    lista: [
      { texto: "Espaço lindo e muito acolhedor. As unhas duram imenso!", nome: "Avaliação de exemplo" },
      { texto: "Marquei pelo site em dois minutos e recebi logo a confirmação.", nome: "Avaliação de exemplo" },
      { texto: "Profissional, atenciosa e pontual. Recomendo.", nome: "Avaliação de exemplo" }
    ]
  },

  // ---------- Agenda ----------
  agenda: {
    intervaloMin: 30,                        // tamanho de cada bloco da agenda
    // Horas de abertura por dia. Vários intervalos = pausa de almoço.
    // null = fechado.  Formato: [["abre","fecha"], ...]
    horario: {
      seg: [["09:30", "13:00"], ["14:00", "19:00"]],
      ter: [["09:30", "13:00"], ["14:00", "19:00"]],
      qua: [["09:30", "13:00"], ["14:00", "19:00"]],
      qui: [["09:30", "13:00"], ["14:00", "19:00"]],
      sex: [["09:30", "19:00"]],
      sab: [["09:00", "17:00"]],
      dom: null
    }
  },

  // ---------- Serviços (min = duração em minutos) ----------
  servicos: [
    { cat: "Estética", nome: "Lifting de pestanas", desc: "Olhar aberto sem extensões", min: 90, preco: 25 },
    { cat: "Estética", nome: "Brow lamination", desc: "Sobrancelhas definidas e alinhadas", min: 90, preco: 25 },
    { cat: "Estética", nome: "Maquilhagem social", desc: "Para eventos e ocasiões especiais", min: 90, preco: 35 },
    { cat: "Estética", nome: "Combo lifting + brow lamination", desc: "Pestanas e sobrancelhas numa só visita", min: 120, preco: 40 },
    { cat: "Manicure e Pedicure", nome: "Manicure", desc: "Unhas cuidadas e verniz clássico", min: 60, preco: 8 },
    { cat: "Manicure e Pedicure", nome: "Verniz gel", desc: "Brilho que dura até três semanas", min: 90, preco: 12 },
    { cat: "Manicure e Pedicure", nome: "Unhas de gel (aplicação)", desc: "Alongamento com acabamento natural", min: 120, preco: 25 },
    { cat: "Manicure e Pedicure", nome: "Unhas de gel (manutenção)", desc: "Preenchimento e novo acabamento", min: 90, preco: 18 },
    { cat: "Manicure e Pedicure", nome: "Spa de pés", desc: "Esfoliação, hidratação e verniz", min: 60, preco: 15 },
    { cat: "Massagens", nome: "Massagem de relaxamento", desc: "Óleos essenciais e música calma", min: 60, preco: 30 },
    { cat: "Massagens", nome: "Massagem de pedras quentes", desc: "Calor que solta a tensão", min: 60, preco: 38 },
    { cat: "Massagens", nome: "Drenagem linfática", desc: "Pernas leves, menos retenção", min: 60, preco: 25 },
    { cat: "Tratamentos Faciais", nome: "Limpeza de pele profunda", desc: "Pele limpa, luminosa e hidratada", min: 90, preco: 30 },
    { cat: "Depilação", nome: "Depilação buço", desc: "Rápida e com cera suave", min: 30, preco: 3 },
    { cat: "Depilação", nome: "Depilação sobrancelhas", desc: "Desenho a acompanhar o rosto", min: 30, preco: 7 },
    { cat: "Depilação", nome: "Depilação perna completa", desc: "Cera morna, pele macia", min: 60, preco: 15 }
  ],

  pagamentos: ["💳 MB Way", "🏧 Multibanco", "💶 Numerário (no local)"],
  pedirNif: true,

  // Vouchers de plataformas (ex.: Odisseias). ativo:false esconde tudo.
  vouchers: { ativo: true, nome: "Odisseias" },

  // ---------- Equipa ----------
  // Salão de uma pessoa: deixe a lista vazia. Com equipa: veja exemplos/loja-equipa.js
  equipa: [
    // id: curto, sem espaços. foto: quadrada. servicos: ["*"] = todos, ou a lista de nomes.
    // horario: opcional; sem ele usa o horário do salão. cor: aparece na agenda do painel.
    { id: "ana", nome: "Ana", cargo: "Pestanas e sobrancelhas", foto: "img/equipa/ana.svg", cor: "#b07a8c",
      servicos: ["Lifting de pestanas", "Brow lamination", "Maquilhagem social", "Combo lifting + brow lamination", "Depilação buço", "Depilação sobrancelhas"] },
    { id: "rita", nome: "Rita", cargo: "Unhas", foto: "img/equipa/rita.svg", cor: "#c0895f",
      servicos: ["Manicure", "Verniz gel", "Unhas de gel (aplicação)", "Unhas de gel (manutenção)", "Spa de pés"],
      horario: { seg: null, ter: [["10:00", "19:00"]], qua: [["10:00", "19:00"]], qui: [["10:00", "19:00"]], sex: [["10:00", "19:00"]], sab: [["09:00", "17:00"]], dom: null } },
    { id: "ines", nome: "Inês", cargo: "Massagens e rosto", foto: "img/equipa/ines.svg", cor: "#8a6fa6",
      servicos: ["Massagem de relaxamento", "Massagem de pedras quentes", "Drenagem linfática", "Limpeza de pele profunda", "Depilação perna completa"] }
  ],

  // ---------- Painel ----------
  admin: { nome: "Aurora", titulo: "Área da equipa 👑" },

  mensagens: {
    // {nome} {servico} {data} {hora} {loja}
    confirmacao: "Olá {nome}! ✨ A sua marcação para *{servico}* está confirmada para dia *{data} às {hora}* no {loja}. Muito obrigada! 👑",
    confirmacaoVarias: "Olá {nome}! ✨ As suas marcações no {loja} estão confirmadas:",
    despedida: "Muito obrigada e até breve! 👑"
  },

  // ---------- Serviços externos ----------
  // EmailJS (email de confirmação à cliente). Deixa "" para desligar.
  // A public key do EmailJS é pública por natureza: restringe o domínio no painel do EmailJS.
  emailjs: { publicKey: "", servico: "", template: "" },

  // Firebase do cliente (Consola Firebase > Definições do projeto > A tua app Web).
  // apiKey vazio = MODO DEMONSTRAÇÃO (dados fictícios guardados só no navegador).
  firebase: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    appId: ""
  },
  regiaoBD: "europe-west1",                  // região da Realtime Database (para as Functions)
  fuso: "Europe/Lisbon",
  resumoDiario: "19:30",                     // hora do resumo WhatsApp para a dona

  creditos: { texto: "Licença atribuída a João Antunes", email: "j.p.r.n.antunes@gmail.com" }
};
