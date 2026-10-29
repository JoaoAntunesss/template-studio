/* =====================================================================
   LOJA.JS — o ÚNICO ficheiro a mudar para cada novo cliente.
   Tudo o resto (site, painel, regras, funções) lê daqui.
   Depois de editar, corre:  node scripts/nova-loja.mjs
   (gera manifest.json, admin-manifest.json, .firebaserc e functions/loja.json)
   ===================================================================== */
window.LOJA = {
  id: "studio-aurora",                       // identificador curto, sem espaços
  nome: "Studio Aurora",
  nomeCurto: "Aurora",                       // nome na app instalada (PWA)
  slogan: "Beleza & Bem-estar",
  descricao: "Estúdio de beleza e estética — marcações online",

  // ---------- Aspeto ----------
  logo: "img/logo.svg",
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
    titulo: "A sua beleza começa aqui",
    subtitulo: "O cuidado certo para o seu bem-estar"
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
    { cat: "Estética", nome: "Lifting de pestanas", min: 90, preco: 25 },
    { cat: "Estética", nome: "Brow lamination", min: 90, preco: 25 },
    { cat: "Estética", nome: "Maquilhagem social", min: 90, preco: 35 },
    { cat: "Estética", nome: "Combo lifting + brow lamination", min: 120, preco: 40 },
    { cat: "Manicure e Pedicure", nome: "Manicure", min: 60, preco: 8 },
    { cat: "Manicure e Pedicure", nome: "Verniz gel", min: 90, preco: 12 },
    { cat: "Manicure e Pedicure", nome: "Unhas de gel (aplicação)", min: 120, preco: 25 },
    { cat: "Manicure e Pedicure", nome: "Unhas de gel (manutenção)", min: 90, preco: 18 },
    { cat: "Manicure e Pedicure", nome: "Spa de pés", min: 60, preco: 15 },
    { cat: "Massagens", nome: "Massagem de relaxamento", min: 60, preco: 30 },
    { cat: "Massagens", nome: "Massagem de pedras quentes", min: 60, preco: 38 },
    { cat: "Massagens", nome: "Drenagem linfática", min: 60, preco: 25 },
    { cat: "Tratamentos Faciais", nome: "Limpeza de pele profunda", min: 90, preco: 30 },
    { cat: "Depilação", nome: "Depilação buço", min: 30, preco: 3 },
    { cat: "Depilação", nome: "Depilação sobrancelhas", min: 30, preco: 7 },
    { cat: "Depilação", nome: "Depilação perna completa", min: 60, preco: 15 }
  ],

  pagamentos: ["💳 MB Way", "🏧 Multibanco", "💶 Numerário (no local)"],
  pedirNif: true,

  // Vouchers de plataformas (ex.: Odisseias). ativo:false esconde tudo.
  vouchers: { ativo: true, nome: "Odisseias" },

  // ---------- Painel ----------
  admin: { nome: "Aurora", titulo: "Área da Aurora 👑" },

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
