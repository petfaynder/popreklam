const fs = require('fs');
const path = require('path');

const ptTranslations = {
  "nav": {
    "advertisers": "Anunciantes",
    "publishers": "Editores",
    "howItWorks": "Como Funciona",
    "faq": "FAQ",
    "contact": "Contato",
    "blog": "Blog",
    "docs": "Documentação",
    "login": "Entrar",
    "getStarted": "Começar",
    "dashboard": "Painel",
    "logout": "Sair",
    "subscribe": "Inscrever-se"
  },
  "footer": {
    "platform": "Plataforma",
    "resources": "Recursos",
    "company": "Empresa",
    "legal": "Legal",
    "tagline": "A rede de anúncios de alto desempenho para editores e anunciantes.",
    "taglineSaaS": "A rede de anúncios moderna.",
    "taglineLuminous": "Monetize de forma inteligente.",
    "taglineAzure": "Alcance seu público com precisão.",
    "copyright": "© {year} MrPop.io",
    "links": {
      "adFormats": "Formatos de Anúncio",
      "smartLink": "Smart Link",
      "antiAdblock": "Anti-Adblock",
      "howItWorks": "Como Funciona",
      "blog": "Blog",
      "docs": "Documentação",
      "contact": "Contato",
      "faq": "FAQ",
      "status": "Status",
      "privacy": "Política de Privacidade",
      "terms": "Termos de Serviço",
      "publishers": "Editores",
      "advertisers": "Anunciantes"
    }
  },
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "loading": "Carregando...",
    "error": "Algo deu errado",
    "success": "Sucesso",
    "noData": "Sem dados",
    "retry": "Tentar novamente",
    "close": "Fechar",
    "confirm": "Confirmar",
    "delete": "Excluir",
    "edit": "Editar",
    "view": "Visualizar",
    "search": "Buscar",
    "all": "Todos",
    "active": "Ativo",
    "status": "Status",
    "actions": "Ações",
    "date": "Data",
    "amount": "Valor",
    "total": "Total",
    "name": "Nome",
    "email": "E-mail"
  },
  "auth": {
    "loginTitle": "Bem-vindo de volta",
    "loginSubtitle": "Faça login na sua conta MrPop.io",
    "registerTitle": "Crie sua conta",
    "registerSubtitle": "Junte-se a mais de 10.000 usuários",
    "emailLabel": "E-mail",
    "passwordLabel": "Senha",
    "loginBtn": "Entrar",
    "registerBtn": "Criar Conta",
    "rolePublisher": "Editor",
    "roleAdvertiser": "Anunciante",
    "roleLabel": "Eu sou um"
  },
  "publisher": {
    "nav": {
      "dashboard": "Painel",
      "analytics": "Análises",
      "sites": "Sites",
      "payments": "Pagamentos",
      "settings": "Configurações"
    },
    "dashboard": {
      "title": "Painel",
      "totalEarnings": "Ganhos Totais",
      "impressions": "Impressões",
      "clicks": "Cliques",
      "ctr": "CTR",
      "cpm": "CPM"
    }
  },
  "advertiser": {
    "nav": {
      "dashboard": "Painel",
      "campaigns": "Campanhas",
      "billing": "Faturamento",
      "settings": "Configurações"
    },
    "dashboard": {
      "title": "Painel",
      "totalSpent": "Total Gasto",
      "activeCampaigns": "Campanhas Ativas"
    }
  },
  "faq": {
    "title": "Perguntas Frequentes",
    "titleBrutalist": "F.A.Q.",
    "subtitle": "Encontre respostas para perguntas comuns",
    "searchPlaceholder": "Pesquisar...",
    "notFound": "Nenhuma pergunta encontrada.",
    "categories": {
      "all": "Todos",
      "publishers": "Editores",
      "advertisers": "Anunciantes"
    },
    "questions": {
      "q1": "Quanto posso ganhar?",
      "a1": "Os ganhos variam de acordo com a qualidade do tráfego.",
      "q2": "Quais são os requisitos?",
      "a2": "Mínimo de 1.000 visitantes diários.",
      "q3": "Como instalo o código?",
      "a3": "Copie e cole o JavaScript antes da tag body.",
      "q4": "Posso usar com o Google AdSense?",
      "a4": "Sim, é 100% compatível."
    }
  },
  "contact": {
    "title": "Entre em Contato",
    "nameLabel": "Nome Completo",
    "emailLabel": "E-mail",
    "subjectLabel": "Assunto",
    "messageLabel": "Mensagem",
    "sendBtn": "Enviar Mensagem"
  },
  "forPublishers": {
    "heroTitle": "Monetize Seu Tráfego",
    "heroSubtitle": "Até $8 CPM. Pagamentos semanais.",
    "heroCta": "Começar a Ganhar",
    "howTitle": "Como Funciona",
    "steps": {
      "s1": "Inscreva-se",
      "s2": "Adicione seu Site",
      "s3": "Instale o Código",
      "s4": "Ganhe Dinheiro"
    }
  },
  "forAdvertisers": {
    "heroTitle": "Alcance Milhões de Usuários",
    "heroSubtitle": "Tráfego de 10.000+ sites premium. Comece com $100.",
    "heroCta": "Lançar Campanha",
    "formatsTitle": "Formatos de Anúncio"
  },
  "howItWorks": {
    "title": "Como o MrPop.io Funciona",
    "forPublishers": "Para Editores",
    "forAdvertisers": "Para Anunciantes"
  }
};

const deTranslations = {
  "nav": {
    "advertisers": "Werbetreibende",
    "publishers": "Publisher",
    "howItWorks": "Wie es funktioniert",
    "faq": "FAQ",
    "contact": "Kontakt",
    "blog": "Blog",
    "docs": "Dokumentation",
    "login": "Anmelden",
    "getStarted": "Loslegen",
    "dashboard": "Dashboard",
    "logout": "Abmelden",
    "subscribe": "Abonnieren"
  },
  "footer": {
    "platform": "Plattform",
    "resources": "Ressourcen",
    "company": "Unternehmen",
    "legal": "Rechtliches",
    "tagline": "Das leistungsstarke Werbenetzwerk für Publisher und Werbetreibende.",
    "taglineSaaS": "Das moderne Werbenetzwerk.",
    "taglineLuminous": "Monetarisieren Sie intelligenter.",
    "taglineAzure": "Erreichen Sie Ihre Zielgruppe.",
    "copyright": "© {year} MrPop.io",
    "links": {
      "adFormats": "Anzeigenformate",
      "smartLink": "Smart Link",
      "antiAdblock": "Anti-Adblock",
      "howItWorks": "Wie es funktioniert",
      "blog": "Blog",
      "docs": "Dokumentation",
      "contact": "Kontakt",
      "faq": "FAQ",
      "status": "Status",
      "privacy": "Datenschutz",
      "terms": "Nutzungsbedingungen",
      "publishers": "Publisher",
      "advertisers": "Werbetreibende"
    }
  },
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "loading": "Wird geladen...",
    "error": "Etwas ist schiefgelaufen",
    "success": "Erfolg",
    "noData": "Keine Daten verfügbar",
    "retry": "Wiederholen",
    "close": "Schließen",
    "confirm": "Bestätigen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "view": "Ansehen",
    "search": "Suchen",
    "all": "Alle",
    "active": "Aktiv",
    "status": "Status",
    "actions": "Aktionen",
    "date": "Datum",
    "amount": "Betrag",
    "total": "Gesamt",
    "name": "Name",
    "email": "E-Mail"
  },
  "auth": {
    "loginTitle": "Willkommen zurück",
    "loginSubtitle": "Melden Sie sich an",
    "registerTitle": "Konto erstellen",
    "registerSubtitle": "Treten Sie über 10.000 Nutzern bei",
    "emailLabel": "E-Mail",
    "passwordLabel": "Passwort",
    "loginBtn": "Anmelden",
    "registerBtn": "Konto erstellen",
    "rolePublisher": "Publisher",
    "roleAdvertiser": "Werbetreibender",
    "roleLabel": "Ich bin ein"
  },
  "publisher": {
    "nav": {
      "dashboard": "Dashboard",
      "analytics": "Analytik",
      "sites": "Websites",
      "payments": "Auszahlungen",
      "settings": "Einstellungen"
    },
    "dashboard": {
      "title": "Dashboard",
      "totalEarnings": "Gesamteinnahmen",
      "impressions": "Impressionen",
      "clicks": "Klicks",
      "ctr": "CTR",
      "cpm": "CPM"
    }
  },
  "advertiser": {
    "nav": {
      "dashboard": "Dashboard",
      "campaigns": "Kampagnen",
      "billing": "Abrechnung",
      "settings": "Einstellungen"
    },
    "dashboard": {
      "title": "Dashboard",
      "totalSpent": "Gesamtausgaben",
      "activeCampaigns": "Aktive Kampagnen"
    }
  },
  "faq": {
    "title": "Häufig gestellte Fragen",
    "titleBrutalist": "F.A.Q.",
    "subtitle": "Finden Sie Antworten auf häufige Fragen",
    "searchPlaceholder": "Suchen...",
    "notFound": "Keine Fragen gefunden.",
    "categories": {
      "all": "Alle",
      "publishers": "Publisher",
      "advertisers": "Werbetreibende"
    },
    "questions": {
      "q1": "Wie viel kann ich verdienen?",
      "a1": "Einnahmen variieren je nach Traffic-Qualität.",
      "q2": "Was sind die Voraussetzungen?",
      "a2": "Mindestens 1.000 tägliche Besucher.",
      "q3": "Wie installiere ich den Code?",
      "a3": "Kopieren und fügen Sie den JavaScript-Code vor dem body-Tag ein.",
      "q4": "Ist es mit Google AdSense kompatibel?",
      "a4": "Ja, 100% kompatibel."
    }
  },
  "contact": {
    "title": "Kontaktieren Sie uns",
    "nameLabel": "Vollständiger Name",
    "emailLabel": "E-Mail",
    "subjectLabel": "Betreff",
    "messageLabel": "Nachricht",
    "sendBtn": "Nachricht senden"
  },
  "forPublishers": {
    "heroTitle": "Monetarisieren Sie Ihren Traffic",
    "heroSubtitle": "Bis zu $8 CPM. Wöchentliche Auszahlungen.",
    "heroCta": "Jetzt verdienen",
    "howTitle": "Wie es funktioniert",
    "steps": {
      "s1": "Kostenlos anmelden",
      "s2": "Website hinzufügen",
      "s3": "Code installieren",
      "s4": "Geld verdienen"
    }
  },
  "forAdvertisers": {
    "heroTitle": "Erreichen Sie Millionen von Nutzern",
    "heroSubtitle": "Premium-Traffic. Starten Sie ab $100.",
    "heroCta": "Kampagne starten",
    "formatsTitle": "Anzeigenformate"
  },
  "howItWorks": {
    "title": "Wie MrPop.io funktioniert",
    "forPublishers": "Für Publisher",
    "forAdvertisers": "Für Werbetreibende"
  }
};

async function main() {
  // Save PT
  const ptPath = path.join(__dirname, 'messages', 'pt.json');
  let ptJson = {};
  if (fs.existsSync(ptPath)) ptJson = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
  for(let k in ptTranslations) ptJson[k] = ptTranslations[k];
  fs.writeFileSync(ptPath, JSON.stringify(ptJson, null, 2));

  // Save DE
  const dePath = path.join(__dirname, 'messages', 'de.json');
  let deJson = {};
  if (fs.existsSync(dePath)) deJson = JSON.parse(fs.readFileSync(dePath, 'utf8'));
  for(let k in deTranslations) deJson[k] = deTranslations[k];
  fs.writeFileSync(dePath, JSON.stringify(deJson, null, 2));

  console.log('✅ PT and DE subpages translated!');
}

main();
