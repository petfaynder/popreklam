const fs = require('fs');
const path = require('path');

const data = {
  es: {
    trustedBy: "Con la confianza de más de 10.000 editores",
    heroTitleHtml: "EL TRÁFICO <br /> <span class=\"text-primary italic\">SE ENCUENTRA CON</span> <br /> EL DINERO",
    heroDesc: "La red publicitaria mejor pagada diseñada para editores serios. Segmentación impulsada por IA, tasa de relleno del 100%, pagos semanales.",
    startEarning: "Empieza a Ganar →",
    launchAds: "Lanzar Anuncios",
    marquee: {
      highCpm: "★ ALTAS TASAS DE CPM",
      weekly: "★ PAGOS SEMANALES",
      fill: "★ 100% DE TASA DE RELLENO",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ ESTADÍSTICAS EN TIEMPO REAL",
      geos: "★ 248 GEOs"
    },
    stats: {
      fillRate: { label: "Tasa de Relleno", desc: "Cada impresión monetizada, cada país cubierto." },
      avgCpm: { label: "CPM Promedio", desc: "El tráfico de nivel 1 gana lo que merece." },
      payouts: { label: "Pagos", desc: "BTC, USDT, PayPal, Transferencia. Siempre a tiempo." },
      geos: { label: "GEOs", desc: "Cobertura global de anunciantes directos." }
    },
    forPublishers: {
      titleHtml: "PARA<br />EDITORES",
      desc: "Maximiza los ingresos de cada impresión. Nuestro feed de anuncios optimizado por IA ofrece las tasas de eCPM más altas con anuncios limpios y seguros.",
      b1: "Hasta el 70% de participación en los ingresos",
      b2: "6 formatos de anuncios de alto impacto",
      b3: "Pago mínimo de $5",
      b4: "Gerente de cuenta dedicado",
      b5: "Solución anti-adblock",
      cta: "Únete como Editor"
    },
    forAdvertisers: {
      titleHtml: "PARA<br />ANUNCIANTES",
      desc: "Llega a audiencias de alta intención en 248 GEOs. Más de 20 configuraciones de segmentación, pujas inteligentes y análisis en tiempo real.",
      b1: "Tráfico directo de editores",
      b2: "Segmentación avanzada por GEO/Dispositivo/SO",
      b3: "CPM Inteligente y Objetivo de CPA",
      b4: "Depósito mínimo de $100",
      b5: "Protección contra fraude de 3 niveles",
      cta: "Lanzar Campaña"
    },
    adFormats: {
      titleHtml: "Formatos de Anuncios <br /><span class=\"text-outline text-foreground\">que Convierten</span>",
      desc: "Unidades de anuncios no intrusivas y de alto rendimiento que ofrecen más de 2.000 millones de impresiones mensuales en todos los dispositivos.",
      popunder: { title: "Popunder", desc: "Anuncios a página completa detrás de la ventana principal. Las tasas de CPM más altas, cero ceguera a los banners." },
      push: { title: "In-Page Push", desc: "Notificaciones amigables con el navegador. No se requiere suscripción. CTR 30 veces mayor que el web push." },
      interstitial: { title: "Intersticial", desc: "Cobertura a pantalla completa entre páginas. Máximo impacto visual y compromiso." },
      smartLink: { title: "Smart Link", desc: "La IA dirige automáticamente a la oferta mejor pagada. Ideal para tráfico social y de referencia." },
      native: { title: "Anuncios Nativos", desc: "Se combinan perfectamente con el contenido del sitio. Los editores controlan los colores, tamaños y ubicación." },
      banner: { title: "Anuncios de Banner", desc: "Estándares clásicos de IAB. Beneficios estables para computadoras de escritorio y móviles." }
    },
    whyUs: {
      title: "Por qué más de 10.000 socios confían en nosotros",
      safety: { title: "Seguridad y Calidad de los Anuncios", desc: "El sistema de seguridad de 3 niveles evita el malware, el fraude y el tráfico de bots." },
      care: { title: "Atención al Socio", desc: "Más que soporte. Gerentes dedicados ayudan a optimizar campañas, mejorar la estrategia y aumentar sus ingresos." },
      tools: { title: "Herramientas de Rendimiento", desc: "CPM Inteligente, Objetivo de CPA, Estimador de Tráfico. Automatiza las pujas." },
      global: { title: "Cobertura Global", desc: "Editores directos de 248 GEOs. Tráfico premium desde Tier-1 hasta Tier-3." },
      ecpm: { title: "eCPM Competitivo", desc: "Nuestro modelo de eCPM recompensa la calidad. Más clics y conversiones = mayores ganancias." },
      payouts: { title: "Pagos Rápidos", desc: "Pago mínimo de $5. Pagos semanales automatizados a través de PayPal, USDT, Bitcoin y más." }
    },
    steps: {
      title: "Empieza en 4 Pasos",
      s1: { title: "Regístrate", desc: "Crea tu cuenta en menos de 2 minutos. Sin retrasos por aprobación." },
      s2: { title: "Añade tu Sitio", desc: "Envía tu sitio web o fuente de tráfico para una verificación rápida." },
      s3: { title: "Obtén el Código", desc: "Copia nuestra etiqueta ligera de JavaScript. Una sola línea de código." },
      s4: { title: "Gana Dinero", desc: "Observa cómo crecen los ingresos en tiempo real. Cobra semanalmente." }
    },
    testimonials: {
      title: "Lo que Dicen Nuestros Socios",
      t1: { name: "Alex M.", role: "Editor • Nicho de Juegos", quote: "Cambié de AdSense a MrPop.io. Mis ingresos literalmente se triplicaron en el primer mes." },
      t2: { name: "Sarah K.", role: "Comprador de Medios", quote: "La granularidad de la segmentación es increíble. El Objetivo de CPA me ahorró miles al auto-optimizar mis campañas." },
      t3: { name: "Dmitri V.", role: "Editor • Blog de Tecnología", quote: "Pagos semanales a través de USDT. Sin retrasos. Mi gerente de cuenta me ayudó a obtener un 40% más de ingresos." }
    },
    faq: {
      title: "Preguntas Frecuentes",
      q1: { q: "¿Cuánto puedo ganar?", a: "Las ganancias varían según la calidad del tráfico y el GEO. El tráfico de Nivel 1 puede ganar entre $5 y $8+ de CPM." },
      q2: { q: "¿Cuál es el pago mínimo?", a: "Solo $5 a través de Paxum. Otros métodos como PayPal y USDT tienen mínimos ligeramente más altos." },
      q3: { q: "¿Qué formatos de anuncios admiten?", a: "Admitimos Popunder, In-Page Push, Intersticial, Smart Link, Anuncios Nativos y Banners." },
      q4: { q: "¿Cómo funciona la protección contra el fraude?", a: "Nuestro sistema detecta y bloquea el tráfico de bots, el malware y los clics fraudulentos en tiempo real." },
      q5: { q: "¿Qué opciones de segmentación están disponibles?", a: "Más de 20 configuraciones de segmentación que incluyen País, Ciudad, SO, Navegador, Tipo de Dispositivo y más." }
    },
    cta: {
      bgText: "ÚNETE A NOSOTROS",
      title1: "¿Listo para",
      title2: "Dominar?",
      subtitle: "Únete a más de 10.000 editores y anunciantes que ya están escalando con nosotros.",
      publisher: "Registro de Editor",
      advertiser: "Registro de Anunciante"
    }
  },
  pt: {
    trustedBy: "Com a confiança de mais de 10.000 editores",
    heroTitleHtml: "O TRÁFEGO <br /> <span class=\"text-primary italic\">ENCONTRA</span> <br /> O DINHEIRO",
    heroDesc: "A rede de publicidade mais bem paga construída para editores sérios. Segmentação baseada em IA, taxa de preenchimento de 100%, pagamentos semanais.",
    startEarning: "Comece a Ganhar →",
    launchAds: "Lançar Anúncios",
    marquee: {
      highCpm: "★ ALTAS TAXAS DE CPM",
      weekly: "★ PAGAMENTOS SEMANAIS",
      fill: "★ 100% DE TAXA DE PREENCHIMENTO",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ ESTATÍSTICAS EM TEMPO REAL",
      geos: "★ 248 GEOs"
    },
    stats: {
      fillRate: { label: "Taxa de Preenchimento", desc: "Cada impressão monetizada, cada país coberto." },
      avgCpm: { label: "CPM Médio", desc: "O tráfego de nível 1 ganha o que merece." },
      payouts: { label: "Pagamentos", desc: "BTC, USDT, PayPal, Transferência. Sempre no prazo." },
      geos: { label: "GEOs", desc: "Cobertura global de anunciantes diretos." }
    },
    forPublishers: {
      titleHtml: "PARA<br />EDITORES",
      desc: "Maximize a receita de cada impressão. Nosso feed de anúncios otimizado por IA oferece as taxas de eCPM mais altas com anúncios limpos e seguros.",
      b1: "Até 70% de participação na receita",
      b2: "6 formatos de anúncios de alto impacto",
      b3: "Pagamento mínimo de $5",
      b4: "Gerente de conta dedicado",
      b5: "Solução anti-adblock",
      cta: "Junte-se como Editor"
    },
    forAdvertisers: {
      titleHtml: "PARA<br />ANUNCIANTES",
      desc: "Alcance públicos de alta intenção em 248 GEOs. Mais de 20 configurações de segmentação, lances inteligentes e análises em tempo real.",
      b1: "Tráfego direto de editores",
      b2: "Segmentação avançada por GEO/Dispositivo/SO",
      b3: "CPM Inteligente e Objetivo de CPA",
      b4: "Depósito mínimo de $100",
      b5: "Proteção contra fraude de 3 níveis",
      cta: "Lançar Campanha"
    },
    adFormats: {
      titleHtml: "Formatos de Anúncios <br /><span class=\"text-outline text-foreground\">que Convertem</span>",
      desc: "Unidades de anúncios não intrusivas e de alto desempenho atendendo a mais de 2 bilhões de impressões mensais em todos os dispositivos.",
      popunder: { title: "Popunder", desc: "Anúncios em tela cheia atrás da janela principal. As taxas de CPM mais altas, zero cegueira de banner." },
      push: { title: "In-Page Push", desc: "Notificações amigáveis do navegador. Não requer inscrição. CTR 30x maior que o web push." },
      interstitial: { title: "Intersticial", desc: "Cobertura de tela cheia entre páginas. Máximo impacto visual." },
      smartLink: { title: "Smart Link", desc: "A IA direciona para a oferta mais bem paga. O melhor para tráfego social." },
      native: { title: "Anúncios Nativos", desc: "Misturam-se perfeitamente com o conteúdo do site. Você controla as cores e o tamanho." },
      banner: { title: "Anúncios de Banner", desc: "Padrões clássicos do IAB. Lucros estáveis para desktop e mobile." }
    },
    whyUs: {
      title: "Por que mais de 10.000 parceiros confiam em nós",
      safety: { title: "Segurança e Qualidade", desc: "O sistema de segurança de 3 níveis evita malware, fraude e tráfego de bots." },
      care: { title: "Suporte ao Parceiro", desc: "Gerentes dedicados ajudam a otimizar campanhas e aumentar sua receita." },
      tools: { title: "Ferramentas de Desempenho", desc: "CPM Inteligente, Objetivo de CPA. Automatize seus lances." },
      global: { title: "Cobertura Global", desc: "Editores diretos de 248 GEOs. Tráfego premium para todas as regiões." },
      ecpm: { title: "eCPM Competitivo", desc: "Nosso modelo eCPM recompensa a qualidade. Mais conversões = mais ganhos." },
      payouts: { title: "Pagamentos Rápidos", desc: "Pagamento mínimo de $5. Pagamentos semanais automatizados." }
    },
    steps: {
      title: "Comece em 4 Passos",
      s1: { title: "Cadastre-se", desc: "Crie sua conta em menos de 2 minutos. Sem atrasos na aprovação." },
      s2: { title: "Adicione seu Site", desc: "Envie seu site ou fonte de tráfego para verificação rápida." },
      s3: { title: "Obtenha o Código", desc: "Copie nossa tag leve em JavaScript. Apenas uma linha de código." },
      s4: { title: "Ganhe Dinheiro", desc: "Veja a receita crescer em tempo real. Receba pagamentos semanalmente." }
    },
    testimonials: {
      title: "O que os Parceiros Dizem",
      t1: { name: "Alex M.", role: "Editor • Nicho de Jogos", quote: "Mudei do AdSense para o MrPop.io. Minha receita triplicou no primeiro mês." },
      t2: { name: "Sarah K.", role: "Comprador de Mídia", quote: "A granularidade da segmentação é incrível. O Objetivo de CPA me economizou milhares." },
      t3: { name: "Dmitri V.", role: "Editor • Blog de Tecnologia", quote: "Pagamentos semanais via USDT. Sem atrasos. Meu gerente ajudou a otimizar os anúncios." }
    },
    faq: {
      title: "Perguntas Frequentes",
      q1: { q: "Quanto posso ganhar?", a: "Os ganhos variam conforme a qualidade do tráfego. O tráfego Tier-1 pode ganhar $5-8+ CPM." },
      q2: { q: "Qual é o pagamento mínimo?", a: "Apenas $5 via Paxum. Outros métodos como PayPal e USDT têm mínimos um pouco mais altos." },
      q3: { q: "Quais formatos vocês suportam?", a: "Suportamos Popunder, In-Page Push, Interstitial, Smart Link, Anúncios Nativos e Banners." },
      q4: { q: "Como funciona a proteção contra fraudes?", a: "Nosso sistema de 3 níveis detecta e bloqueia tráfego de bots e cliques fraudulentos em tempo real." },
      q5: { q: "Quais opções de segmentação estão disponíveis?", a: "Mais de 20 opções, incluindo País, Cidade, SO, Navegador, Dispositivo e Idioma." }
    },
    cta: {
      bgText: "JUNTE-SE A NÓS",
      title1: "Pronto para",
      title2: "Dominar?",
      subtitle: "Junte-se a 10.000+ editores e anunciantes escalando conosco.",
      publisher: "Cadastro de Editor",
      advertiser: "Cadastro de Anunciante"
    }
  },
  fr: {
    trustedBy: "Approuvé par plus de 10 000 éditeurs",
    heroTitleHtml: "LE TRAFIC <br /> <span class=\"text-primary italic\">RENCONTRE</span> <br /> L'ARGENT",
    heroDesc: "Le réseau publicitaire le plus rémunérateur pour les éditeurs sérieux. Ciblage par IA, taux de remplissage de 100%, paiements hebdomadaires.",
    startEarning: "Commencer à gagner →",
    launchAds: "Lancer des publicités",
    marquee: {
      highCpm: "★ TAUX CPM ÉLEVÉS",
      weekly: "★ PAIEMENTS HEBDOMADAIRES",
      fill: "★ 100% DE REMPLISSAGE",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ STATISTIQUES EN DIRECT",
      geos: "★ 248 PAYS"
    },
    stats: {
      fillRate: { label: "Remplissage", desc: "Chaque impression est monétisée, chaque pays est couvert." },
      avgCpm: { label: "CPM Moyen", desc: "Le trafic de niveau 1 gagne ce qu'il mérite." },
      payouts: { label: "Paiements", desc: "BTC, USDT, PayPal, Virement. Toujours à temps." },
      geos: { label: "Pays", desc: "Couverture mondiale par des annonceurs directs." }
    },
    forPublishers: {
      titleHtml: "POUR LES<br />ÉDITEURS",
      desc: "Maximisez les revenus de chaque impression. Notre flux publicitaire optimisé par l'IA offre les meilleurs taux eCPM avec des publicités propres.",
      b1: "Jusqu'à 70% de partage des revenus",
      b2: "6 formats publicitaires percutants",
      b3: "Paiement minimum de 5 $",
      b4: "Gestionnaire de compte dédié",
      b5: "Solution anti-adblock",
      cta: "Rejoindre comme Éditeur"
    },
    forAdvertisers: {
      titleHtml: "POUR LES<br />ANNONCEURS",
      desc: "Atteignez des audiences hautement ciblées dans 248 pays. Plus de 20 paramètres de ciblage et des statistiques en temps réel.",
      b1: "Trafic direct des éditeurs",
      b2: "Ciblage avancé Pays/Appareil/OS",
      b3: "Objectif CPM et CPA intelligent",
      b4: "Dépôt minimum de 100 $",
      b5: "Protection anti-fraude à 3 niveaux",
      cta: "Lancer une campagne"
    },
    adFormats: {
      titleHtml: "Des Formats <br /><span class=\"text-outline text-foreground\">qui Convertissent</span>",
      desc: "Des blocs d'annonces non intrusifs et très performants, diffusant plus de 2 milliards d'impressions par mois.",
      popunder: { title: "Popunder", desc: "Annonces en pleine page derrière la fenêtre principale. Taux CPM les plus élevés." },
      push: { title: "In-Page Push", desc: "Notifications conviviales. Aucun abonnement requis. CTR 30x supérieur." },
      interstitial: { title: "Interstitiel", desc: "Couverture plein écran entre les pages. Impact visuel maximal." },
      smartLink: { title: "Smart Link", desc: "L'IA vous dirige vers l'offre la plus rémunératrice. Idéal pour les réseaux sociaux." },
      native: { title: "Annonces Natives", desc: "S'intègrent parfaitement au contenu. Vous contrôlez l'apparence." },
      banner: { title: "Bannières", desc: "Formats IAB classiques. Profits stables sur ordinateur et mobile." }
    },
    whyUs: {
      title: "Pourquoi 10 000+ partenaires nous font confiance",
      safety: { title: "Sécurité et Qualité", desc: "Système de sécurité à 3 niveaux contre les malwares et les bots." },
      care: { title: "Soutien aux Partenaires", desc: "Des gestionnaires dédiés vous aident à optimiser vos campagnes." },
      tools: { title: "Outils de Performance", desc: "CPM intelligent, objectif CPA, estimateur de trafic." },
      global: { title: "Couverture Mondiale", desc: "Éditeurs directs de 248 pays. Trafic premium de Tiers 1 à 3." },
      ecpm: { title: "eCPM Compétitif", desc: "Notre modèle eCPM récompense la qualité. Plus de clics = plus de gains." },
      payouts: { title: "Paiements Rapides", desc: "Seuil de 5 $. Paiements hebdomadaires automatisés via PayPal, USDT, etc." }
    },
    steps: {
      title: "Commencez en 4 étapes",
      s1: { title: "Inscrivez-vous", desc: "Créez votre compte en moins de 2 minutes." },
      s2: { title: "Ajoutez votre site", desc: "Soumettez votre site web pour une vérification rapide." },
      s3: { title: "Obtenez le code", desc: "Copiez notre balise JavaScript légère." },
      s4: { title: "Gagnez de l'argent", desc: "Voyez vos revenus augmenter en temps réel." }
    },
    testimonials: {
      title: "Ce que disent nos partenaires",
      t1: { name: "Alex M.", role: "Éditeur", quote: "Mes revenus ont triplé le premier mois. L'anti-adblock a récupéré 30 % de mes revenus perdus." },
      t2: { name: "Sarah K.", role: "Annonceur", quote: "La précision du ciblage est incroyable. L'objectif CPA m'a fait économiser des milliers d'euros." },
      t3: { name: "Dmitri V.", role: "Blogueur", quote: "Paiements hebdomadaires par USDT. Mon gestionnaire m'a aidé à optimiser mes annonces pour +40 %." }
    },
    faq: {
      title: "FAQ",
      q1: { q: "Combien puis-je gagner ?", a: "Les revenus dépendent de la qualité du trafic. Le trafic Tiers 1 peut atteindre 5 à 8 $ CPM." },
      q2: { q: "Quel est le seuil de paiement ?", a: "À partir de 5 $ via Paxum. PayPal, Virement et USDT ont des minimums légèrement plus élevés." },
      q3: { q: "Quels formats proposez-vous ?", a: "Popunder, In-Page Push, Interstitiel, Smart Link, Annonces Natives et Bannières." },
      q4: { q: "Comment fonctionne la protection anti-fraude ?", a: "Notre système bloque le trafic de bots et les malwares en temps réel." },
      q5: { q: "Quelles sont les options de ciblage ?", a: "Plus de 20 paramètres incluant le pays, la ville, le navigateur, l'OS, et la langue." }
    },
    cta: {
      bgText: "REJOIGNEZ-NOUS",
      title1: "Prêt à",
      title2: "Dominer ?",
      subtitle: "Rejoignez 10 000+ éditeurs et annonceurs.",
      publisher: "Inscription Éditeur",
      advertiser: "Inscription Annonceur"
    }
  },
  de: {
    trustedBy: "Über 10.000 Publisher vertrauen uns",
    heroTitleHtml: "TRAFFIC <br /> <span class=\"text-primary italic\">TRIFFT AUF</span> <br /> GELD",
    heroDesc: "Das bestbezahlte Werbenetzwerk für Publisher. KI-gesteuertes Targeting, 100% Auslastung, wöchentliche Auszahlungen.",
    startEarning: "Jetzt Geld verdienen →",
    launchAds: "Werbung schalten",
    marquee: {
      highCpm: "★ HOHE CPM-RATEN",
      weekly: "★ WÖCHENTLICHE AUSZAHLUNGEN",
      fill: "★ 100% FILL-RATE",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ ECHTZEIT-STATISTIKEN",
      geos: "★ 248 LÄNDER"
    },
    stats: {
      fillRate: { label: "Fill-Rate", desc: "Jede Impression wird monetarisiert, jedes Land abgedeckt." },
      avgCpm: { label: "Ø CPM", desc: "Tier-1-Traffic verdient das, was er wert ist." },
      payouts: { label: "Auszahlungen", desc: "BTC, USDT, PayPal, Überweisung. Immer pünktlich." },
      geos: { label: "GEOs", desc: "Weltweite Abdeckung durch direkte Werbetreibende." }
    },
    forPublishers: {
      titleHtml: "FÜR<br />PUBLISHER",
      desc: "Maximieren Sie Ihren Umsatz mit jeder Impression. Unser KI-optimierter Anzeigen-Feed liefert höchste eCPM-Raten.",
      b1: "Bis zu 70% Umsatzbeteiligung",
      b2: "6 wirkungsvolle Anzeigenformate",
      b3: "$5 Mindestauszahlung",
      b4: "Persönlicher Account Manager",
      b5: "Anti-Adblock-Lösung",
      cta: "Als Publisher anmelden"
    },
    forAdvertisers: {
      titleHtml: "FÜR<br />WERBETREIBENDE",
      desc: "Erreichen Sie kaufbereite Zielgruppen in 248 Ländern. 20+ Targeting-Optionen und Echtzeit-Analysen.",
      b1: "Direkter Publisher-Traffic",
      b2: "Erweitertes GEO/Geräte/OS-Targeting",
      b3: "Smart CPM & CPA Goal",
      b4: "$100 Mindesteinzahlung",
      b5: "3-stufiger Betrugsschutz",
      cta: "Kampagne starten"
    },
    adFormats: {
      titleHtml: "Anzeigenformate <br /><span class=\"text-outline text-foreground\">die konvertieren</span>",
      desc: "Unaufdringliche, leistungsstarke Anzeigenblöcke mit über 2 Milliarden monatlichen Impressionen auf allen Geräten.",
      popunder: { title: "Popunder", desc: "Vollbildanzeigen hinter dem Hauptfenster. Höchste CPM-Raten." },
      push: { title: "In-Page Push", desc: "Browserfreundliche Benachrichtigungen. Keine Anmeldung erforderlich." },
      interstitial: { title: "Interstitial", desc: "Vollbildabdeckung zwischen Seiten. Maximale visuelle Wirkung." },
      smartLink: { title: "Smart Link", desc: "KI leitet zum bestbezahlten Angebot weiter. Perfekt für Social Media." },
      native: { title: "Native Ads", desc: "Fügen sich nahtlos in den Inhalt ein. Volle Kontrolle für Publisher." },
      banner: { title: "Bannerwerbung", desc: "Klassische IAB-Standards. Stabile Gewinne für Desktop und Mobile." }
    },
    whyUs: {
      title: "Warum uns 10.000+ Partner vertrauen",
      safety: { title: "Sicherheit & Qualität", desc: "3-stufiges Sicherheitssystem verhindert Malware, Betrug und Bot-Traffic." },
      care: { title: "Partner-Support", desc: "Mehr als nur Support. Persönliche Manager helfen bei der Optimierung." },
      tools: { title: "Leistungs-Tools", desc: "Smart CPM, CPA Goal. Automatisieren Sie Ihre Gebote." },
      global: { title: "Weltweite Abdeckung", desc: "Direkte Publisher aus 248 Ländern. Premium-Traffic aus allen Regionen." },
      ecpm: { title: "Wettbewerbsfähiger eCPM", desc: "Unser eCPM-Modell belohnt Qualität. Mehr Klicks = mehr Einnahmen." },
      payouts: { title: "Schnelle Auszahlungen", desc: "$5 Mindestauszahlung. Automatisierte wöchentliche Zahlungen." }
    },
    steps: {
      title: "Starten Sie in 4 Schritten",
      s1: { title: "Registrieren", desc: "Erstellen Sie Ihr Konto in unter 2 Minuten." },
      s2: { title: "Website hinzufügen", desc: "Reichen Sie Ihre Website zur schnellen Überprüfung ein." },
      s3: { title: "Code erhalten", desc: "Kopieren Sie unser leichtes JavaScript-Tag." },
      s4: { title: "Geld verdienen", desc: "Beobachten Sie, wie Ihr Umsatz in Echtzeit wächst." }
    },
    testimonials: {
      title: "Was Partner sagen",
      t1: { name: "Alex M.", role: "Publisher", quote: "Mein Umsatz hat sich im ersten Monat verdreifacht. Anti-Adblock allein hat 30% gerettet." },
      t2: { name: "Sarah K.", role: "Advertiser", quote: "Die Targeting-Tiefe ist verrückt. CPA Goal hat mir Tausende gespart." },
      t3: { name: "Dmitri V.", role: "Tech-Blogger", quote: "Wöchentliche Auszahlungen über USDT. Keine Verzögerungen. Einfach perfekt." }
    },
    faq: {
      title: "Häufige Fragen",
      q1: { q: "Wie viel kann ich verdienen?", a: "Einnahmen variieren nach Traffic-Qualität. Tier-1-Traffic kann $5-8+ CPM verdienen." },
      q2: { q: "Wie hoch ist die Mindestauszahlung?", a: "Nur $5 über Paxum. PayPal, Überweisung und USDT sind etwas höher." },
      q3: { q: "Welche Anzeigenformate gibt es?", a: "Popunder, In-Page Push, Interstitial, Smart Link, Native Ads und Banner." },
      q4: { q: "Wie funktioniert der Betrugsschutz?", a: "Unser System blockiert Bot-Traffic und Malware in Echtzeit." },
      q5: { q: "Welche Targeting-Optionen gibt es?", a: "Über 20 Einstellungen einschließlich Land, Stadt, Betriebssystem und Browser." }
    },
    cta: {
      bgText: "WERDEN SIE PARTNER",
      title1: "Bereit zu",
      title2: "dominieren?",
      subtitle: "Schließen Sie sich über 10.000 Publishern und Werbetreibenden an.",
      publisher: "Als Publisher anmelden",
      advertiser: "Als Werbetreibender anmelden"
    }
  },
  id: {
    trustedBy: "Dipercaya oleh 10.000+ Publisher",
    heroTitleHtml: "TRAFIK <br /> <span class=\"text-primary italic\">BERTEMU</span> <br /> UANG",
    heroDesc: "Jaringan iklan dengan bayaran tertinggi untuk publisher serius. Penargetan berbasis AI, 100% fill rate, pembayaran mingguan.",
    startEarning: "Mulai Menghasilkan →",
    launchAds: "Luncurkan Iklan",
    marquee: {
      highCpm: "★ TINGKAT CPM TINGGI",
      weekly: "★ PEMBAYARAN MINGGUAN",
      fill: "★ 100% FILL RATE",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ STATISTIK REAL-TIME",
      geos: "★ 248 NEGARA"
    },
    stats: {
      fillRate: { label: "Fill Rate", desc: "Setiap tayangan dimonetisasi, setiap negara dicakup." },
      avgCpm: { label: "Rata-rata CPM", desc: "Trafik Tier-1 mendapatkan bayaran yang layak." },
      payouts: { label: "Pembayaran", desc: "BTC, USDT, PayPal, Transfer Bank. Selalu tepat waktu." },
      geos: { label: "GEOs", desc: "Cakupan global dari pengiklan langsung." }
    },
    forPublishers: {
      titleHtml: "UNTUK<br />PUBLISHER",
      desc: "Maksimalkan pendapatan dari setiap tayangan. Umpan iklan kami yang dioptimalkan AI memberikan tingkat eCPM tertinggi dengan iklan bersih dan aman.",
      b1: "Hingga 70% pembagian pendapatan",
      b2: "6 format iklan berdampak tinggi",
      b3: "$5 batas pembayaran minimum",
      b4: "Manajer akun khusus",
      b5: "Solusi Anti-adblock",
      cta: "Gabung sebagai Publisher"
    },
    forAdvertisers: {
      titleHtml: "UNTUK<br />PENGIKLAN",
      desc: "Jangkau audiens berniat tinggi di 248 GEO. 20+ pengaturan penargetan, penawaran cerdas, dan analitik real-time.",
      b1: "Trafik publisher langsung",
      b2: "Penargetan GEO/Perangkat/OS Lanjutan",
      b3: "CPM Pintar & Target CPA",
      b4: "$100 deposit minimum",
      b5: "Perlindungan penipuan 3 lapis",
      cta: "Luncurkan Kampanye"
    },
    adFormats: {
      titleHtml: "Format Iklan <br /><span class=\"text-outline text-foreground\">yang Mengonversi</span>",
      desc: "Unit iklan berkinerja tinggi dan tidak mengganggu, menayangkan lebih dari 2 Miliar tayangan bulanan di semua perangkat.",
      popunder: { title: "Popunder", desc: "Iklan layar penuh di belakang jendela utama. Tingkat CPM tertinggi." },
      push: { title: "In-Page Push", desc: "Notifikasi ramah browser. Tidak memerlukan izin." },
      interstitial: { title: "Interstitial", desc: "Cakupan layar penuh di antara halaman. Dampak visual maksimal." },
      smartLink: { title: "Smart Link", desc: "AI secara otomatis merutekan ke penawaran dengan bayaran tertinggi." },
      native: { title: "Iklan Native", desc: "Menyatu dengan konten situs. Publisher mengontrol warna dan ukuran." },
      banner: { title: "Iklan Banner", desc: "Standar IAB klasik. Keuntungan stabil untuk desktop dan seluler." }
    },
    whyUs: {
      title: "Mengapa 10.000+ Mitra Mempercayai Kami",
      safety: { title: "Keamanan & Kualitas", desc: "Sistem keamanan 3 tingkat mencegah malware, penipuan, dan trafik bot." },
      care: { title: "Dukungan Mitra", desc: "Manajer khusus membantu mengoptimalkan kampanye dan meningkatkan pendapatan Anda." },
      tools: { title: "Alat Kinerja", desc: "Smart CPM, CPA Goal. Otomatiskan penawaran Anda." },
      global: { title: "Cakupan Global", desc: "Publisher langsung dari 248 GEO. Trafik premium dari Tier-1 hingga Tier-3." },
      ecpm: { title: "eCPM Kompetitif", desc: "Model eCPM kami menghargai kualitas. Lebih banyak konversi = bayaran lebih tinggi." },
      payouts: { title: "Pembayaran Cepat", desc: "$5 minimum pembayaran. Pembayaran mingguan otomatis." }
    },
    steps: {
      title: "Mulai dalam 4 Langkah",
      s1: { title: "Daftar", desc: "Buat akun Anda dalam waktu kurang dari 2 menit." },
      s2: { title: "Tambahkan Situs", desc: "Kirim situs web Anda untuk verifikasi cepat." },
      s3: { title: "Dapatkan Kode", desc: "Salin tag JavaScript ringan kami. Cukup satu baris kode." },
      s4: { title: "Hasilkan Uang", desc: "Saksikan pendapatan tumbuh secara real-time. Dibayar mingguan." }
    },
    testimonials: {
      title: "Apa Kata Mitra Kami",
      t1: { name: "Alex M.", role: "Publisher", quote: "Beralih dari AdSense ke MrPop.io. Pendapatan saya meningkat tiga kali lipat di bulan pertama." },
      t2: { name: "Sarah K.", role: "Pengiklan", quote: "Penargetannya sangat detail. CPA Goal menghemat ribuan dolar dengan mengoptimalkan kampanye secara otomatis." },
      t3: { name: "Dmitri V.", role: "Blogger Teknologi", quote: "Pembayaran mingguan melalui USDT. Tanpa penundaan. Sangat direkomendasikan." }
    },
    faq: {
      title: "FAQ",
      q1: { q: "Berapa banyak yang bisa saya hasilkan?", a: "Penghasilan bervariasi berdasarkan kualitas trafik. Trafik Tier-1 dapat menghasilkan $5-8+ CPM." },
      q2: { q: "Berapa pembayaran minimum?", a: "Hanya $5 melalui Paxum. PayPal, Transfer Bank, dan USDT sedikit lebih tinggi." },
      q3: { q: "Format iklan apa yang didukung?", a: "Kami mendukung Popunder, In-Page Push, Interstitial, Smart Link, Iklan Native, dan Banner." },
      q4: { q: "Bagaimana cara kerja perlindungan penipuan?", a: "Sistem keamanan 3 tingkat kami memblokir trafik bot dan malware secara real-time." },
      q5: { q: "Opsi penargetan apa yang tersedia?", a: "20+ pengaturan termasuk Negara, Kota, OS, Browser, dan Perangkat." }
    },
    cta: {
      bgText: "BERGABUNGLAH",
      title1: "Siap untuk",
      title2: "Mendominasi?",
      subtitle: "Bergabunglah dengan 10.000+ publisher dan pengiklan bersama kami.",
      publisher: "Daftar Publisher",
      advertiser: "Daftar Pengiklan"
    }
  },
  ar: {
    trustedBy: "موثوق به من قبل 10,000+ ناشر",
    heroTitleHtml: "الزيارات <br /> <span class=\"text-primary italic\">تلتقي</span> <br /> بالأرباح",
    heroDesc: "أعلى شبكة إعلانية ربحاً مصممة للناشرين الجادين. استهداف بالذكاء الاصطناعي، معدل تعبئة 100%، مدفوعات أسبوعية.",
    startEarning: "ابدأ في الربح ←",
    launchAds: "إطلاق حملة",
    marquee: {
      highCpm: "★ أعلى معدلات CPM",
      weekly: "★ مدفوعات أسبوعية",
      fill: "★ معدل تعبئة 100%",
      antiAdblock: "★ تجاوز حظر الإعلانات",
      realtime: "★ إحصائيات مباشرة",
      geos: "★ 248 دولة"
    },
    stats: {
      fillRate: { label: "معدل التعبئة", desc: "تحقيق الدخل من كل ظهور، وتغطية كل دولة." },
      avgCpm: { label: "متوسط CPM", desc: "زيارات الدرجة الأولى تكسب ما تستحقه." },
      payouts: { label: "المدفوعات", desc: "دائماً في الوقت المحدد عبر BTC, USDT, PayPal." },
      geos: { label: "الدول", desc: "تغطية عالمية من معلنين مباشرين." }
    },
    forPublishers: {
      titleHtml: "للناشرين",
      desc: "ضاعف إيراداتك من كل ظهور. توفر تغذية الإعلانات المحسّنة بالذكاء الاصطناعي أعلى معدلات eCPM.",
      b1: "مشاركة أرباح تصل إلى 70%",
      b2: "6 أشكال إعلانية عالية التأثير",
      b3: "الحد الأدنى للسحب 5 دولارات",
      b4: "مدير حساب مخصص",
      b5: "حلول لتجاوز حظر الإعلانات",
      cta: "انضم كناشر"
    },
    forAdvertisers: {
      titleHtml: "للمعلنـين",
      desc: "الوصول إلى جماهير عالية الاستهداف في 248 دولة. 20+ إعداد استهداف وتحليلات في الوقت الفعلي.",
      b1: "زيارات ناشرين مباشرة",
      b2: "استهداف متقدم (دولة/جهاز/نظام)",
      b3: "هدف CPA و CPM ذكي",
      b4: "الحد الأدنى للإيداع 100 دولار",
      b5: "حماية من الاحتيال بثلاث مستويات",
      cta: "إطلاق حملة"
    },
    adFormats: {
      titleHtml: "أشكال الإعلانات <br /><span class=\"text-outline text-foreground\">التي تحقق أرباحاً</span>",
      desc: "وحدات إعلانية عالية الأداء غير مزعجة، تخدم أكثر من 2 مليار ظهور شهرياً عبر جميع الأجهزة.",
      popunder: { title: "Popunder", desc: "إعلانات صفحة كاملة خلف النافذة الرئيسية. أعلى معدلات العائد." },
      push: { title: "In-Page Push", desc: "إشعارات متوافقة مع المتصفح. لا تتطلب اشتراك." },
      interstitial: { title: "إعلان بيني", desc: "تغطية بملء الشاشة بين الصفحات. أقصى تأثير مرئي." },
      smartLink: { title: "الرابط الذكي", desc: "يوجه الذكاء الاصطناعي إلى العرض الأعلى أرباحاً. مثالي لزيارات السوشيال ميديا." },
      native: { title: "الإعلانات المدمجة", desc: "تمتزج بسلاسة مع محتوى الموقع." },
      banner: { title: "إعلانات البانر", desc: "معايير IAB الكلاسيكية. أرباح مستقرة." }
    },
    whyUs: {
      title: "لماذا يثق بنا 10,000+ شريك",
      safety: { title: "الأمان والجودة", desc: "نظام أمان من 3 مستويات يمنع البرامج الضارة والزيارات الوهمية." },
      care: { title: "رعاية الشركاء", desc: "مديرون مخصصون يساعدون في تحسين حملاتك وزيادة أرباحك." },
      tools: { title: "أدوات الأداء", desc: "CPM ذكي وهدف CPA. أتمتة تقديم العطاءات الخاصة بك." },
      global: { title: "تغطية عالمية", desc: "ناشرون مباشرون من 248 دولة." },
      ecpm: { title: "eCPM تنافسي", desc: "نموذج العائد لدينا يكافئ الجودة. نقرات أكثر = أرباح أعلى." },
      payouts: { title: "دفع سريع", desc: "الحد الأدنى 5 دولارات. مدفوعات أسبوعية آلية." }
    },
    steps: {
      title: "ابدأ في 4 خطوات",
      s1: { title: "تسجيل", desc: "أنشئ حسابك في أقل من دقيقتين." },
      s2: { title: "أضف موقعك", desc: "أرسل موقع الويب الخاص بك للتحقق السريع." },
      s3: { title: "احصل على الكود", desc: "انسخ كود JavaScript الخفيف الخاص بنا." },
      s4: { title: "اكسب المال", desc: "شاهد الأرباح تنمو في الوقت الفعلي. مدفوعات أسبوعية." }
    },
    testimonials: {
      title: "ماذا يقول شركاؤنا",
      t1: { name: "أليكس م.", role: "ناشر", quote: "انتقلت من أدسنس إلى MrPop.io. تضاعفت أرباحي ثلاث مرات في الشهر الأول." },
      t2: { name: "سارة ك.", role: "معلن", quote: "تفاصيل الاستهداف مذهلة. وفرت لي ميزة هدف CPA آلاف الدولارات." },
      t3: { name: "ديمتري ف.", role: "مدون", quote: "مدفوعات أسبوعية عبر USDT. لا تأخير. أنصح به بشدة." }
    },
    faq: {
      title: "الأسئلة الشائعة",
      q1: { q: "كم يمكنني أن أكسب؟", a: "تختلف الأرباح حسب جودة الزيارات. زيارات الدرجة الأولى يمكن أن تربح 5-8 دولار لكل 1000 ظهور." },
      q2: { q: "ما هو الحد الأدنى للدفع؟", a: "5 دولارات فقط عبر Paxum. المدفوعات تتم أسبوعياً في الوقت المحدد." },
      q3: { q: "ما هي صيغ الإعلانات المدعومة؟", a: "ندعم Popunder و Push و Interstitial والروابط الذكية والبانر." },
      q4: { q: "كيف تعمل حماية الاحتيال؟", a: "نظامنا المكون من 3 مستويات يحظر الزيارات الوهمية والبرامج الضارة فوراً." },
      q5: { q: "ما هي خيارات الاستهداف المتاحة؟", a: "أكثر من 20 خيار استهداف بما في ذلك الدولة والمدينة ونظام التشغيل والمتصفح." }
    },
    cta: {
      bgText: "انضم إلينا الآن",
      title1: "جاهز",
      title2: "للسيطرة؟",
      subtitle: "انضم إلى 10,000+ ناشر ومعلن ينمون معنا.",
      publisher: "تسجيل كناشر",
      advertiser: "تسجيل كمعلن"
    }
  }
};

const locales = ['es', 'fr', 'pt', 'de', 'id', 'ar'];

for (let lang of locales) {
  const targetPath = path.join(__dirname, 'messages', `${lang}.json`);
  let langJson = {};
  if (fs.existsSync(targetPath)) {
      langJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  }
  langJson.themes = langJson.themes || {};
  langJson.themes.brutalist = data[lang];
  fs.writeFileSync(targetPath, JSON.stringify(langJson, null, 2));
  console.log(`✅ Saved ${lang}.json`);
}
