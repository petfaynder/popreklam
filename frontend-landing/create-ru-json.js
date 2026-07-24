const fs = require('fs');
const path = require('path');

const ruTranslations = {
  "nav": {
    "advertisers": "Рекламодатели",
    "publishers": "Издатели",
    "howItWorks": "Как это работает",
    "faq": "FAQ",
    "contact": "Контакты",
    "blog": "Блог",
    "docs": "Документация",
    "login": "Войти",
    "getStarted": "Начать",
    "dashboard": "Панель",
    "logout": "Выйти",
    "subscribe": "Подписаться"
  },
  "footer": {
    "platform": "Платформа",
    "resources": "Ресурсы",
    "company": "Компания",
    "legal": "Юридическая информация",
    "tagline": "Высокоэффективная рекламная сеть для серьезных издателей и рекламодателей.",
    "taglineSaaS": "Современная рекламная сеть для издателей и рекламодателей.",
    "taglineLuminous": "Монетизируйте умнее с рекламной сетью нового поколения.",
    "taglineAzure": "Охватите свою аудиторию с помощью точного таргетинга.",
    "copyright": "© {year} MrPop.io",
    "links": {
      "adFormats": "Форматы рекламы",
      "smartLink": "Смарт-линк",
      "antiAdblock": "Анти-Adblock",
      "howItWorks": "Как это работает",
      "blog": "Блог",
      "docs": "Документация",
      "contact": "Контакты",
      "faq": "FAQ",
      "status": "Статус",
      "privacy": "Политика конфиденциальности",
      "terms": "Условия использования",
      "publishers": "Издатели",
      "advertisers": "Рекламодатели"
    }
  },
  "common": {
    "save": "Сохранить изменения",
    "cancel": "Отмена",
    "loading": "Загрузка...",
    "error": "Что-то пошло не так",
    "success": "Успешно",
    "noData": "Нет данных",
    "retry": "Повторить",
    "close": "Закрыть",
    "confirm": "Подтвердить",
    "delete": "Удалить",
    "edit": "Редактировать",
    "view": "Просмотр",
    "download": "Скачать",
    "upload": "Загрузить",
    "search": "Поиск",
    "filter": "Фильтр",
    "reset": "Сбросить",
    "submit": "Отправить",
    "back": "Назад",
    "next": "Далее",
    "previous": "Назад",
    "all": "Все",
    "active": "Активно",
    "paused": "На паузе",
    "pending": "В ожидании",
    "completed": "Завершено",
    "rejected": "Отклонено",
    "status": "Статус",
    "actions": "Действия",
    "date": "Дата",
    "amount": "Сумма",
    "total": "Итого",
    "name": "Имя",
    "email": "Email",
    "copy": "Копировать",
    "copied": "Скопировано!",
    "required": "Обязательное поле",
    "invalidEmail": "Неверный адрес электронной почты",
    "exportCsv": "Экспорт в CSV",
    "refresh": "Обновить",
    "comingSoon": "Скоро"
  },
  "auth": {
    "loginTitle": "С возвращением",
    "loginSubtitle": "Войдите в свой аккаунт MrPop.io",
    "registerTitle": "Создайте аккаунт",
    "registerSubtitle": "Присоединяйтесь к 10,000+ издателям и рекламодателям",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Пароль",
    "passwordPlaceholder": "Введите пароль",
    "confirmPasswordLabel": "Подтверждение пароля",
    "confirmPasswordPlaceholder": "Повторите пароль",
    "forgotPassword": "Забыли пароль?",
    "loginBtn": "Войти",
    "registerBtn": "Создать аккаунт",
    "noAccount": "Нет аккаунта?",
    "haveAccount": "Уже есть аккаунт?",
    "signUpLink": "Зарегистрироваться",
    "signInLink": "Войти",
    "rolePublisher": "Издатель",
    "roleAdvertiser": "Рекламодатель",
    "roleLabel": "Я",
    "rolePublisherDesc": "Я хочу монетизировать свой сайт",
    "roleAdvertiserDesc": "Я хочу запускать рекламные кампании",
    "termsAgreement": "Создавая аккаунт, вы соглашаетесь с нашими {terms} и {privacy}.",
    "terms": "Условиями использования",
    "privacy": "Политикой конфиденциальности",
    "forgotTitle": "Сброс пароля",
    "forgotSubtitle": "Введите свой email, и мы отправим ссылку для сброса",
    "forgotBtn": "Отправить ссылку",
    "forgotSuccess": "Проверьте почту для получения ссылки",
    "resetTitle": "Установите новый пароль",
    "resetBtn": "Сбросить пароль",
    "resetSuccess": "Пароль успешно обновлен",
    "loginSuccess": "С возвращением!",
    "registerSuccess": "Аккаунт создан! Пожалуйста, проверьте свою электронную почту.",
    "invalidCredentials": "Неверный email или пароль",
    "accountSuspended": "Ваш аккаунт приостановлен",
    "verifyEmail": "Пожалуйста, подтвердите ваш email",
    "twoFactor": "Двухфакторная аутентификация",
    "twoFactorSubtitle": "Введите 6-значный код из вашего приложения",
    "twoFactorCode": "Код аутентификации",
    "twoFactorBtn": "Подтвердить",
    "twoFactorBackup": "Использовать резервный код"
  },
  "publisher": {
    "nav": {
      "dashboard": "Панель",
      "analytics": "Аналитика",
      "sites": "Сайты",
      "adCodes": "Рекламные коды",
      "statistics": "Статистика",
      "payments": "Выплаты",
      "referrals": "Рефералы",
      "reportAd": "Жалоба на рекламу",
      "settings": "Настройки",
      "support": "Поддержка",
      "account": "Аккаунт"
    },
    "topbar": {
      "balance": "Баланс",
      "notifications": "Уведомления",
      "noNotifications": "Пока нет уведомлений",
      "breadcrumb": "Панель издателя",
      "logout": "Выйти"
    },
    "dashboard": {
      "title": "Панель",
      "subtitle": "Обзор ваших доходов",
      "totalEarnings": "Общий доход",
      "todayEarnings": "Доход за сегодня",
      "impressions": "Показы",
      "clicks": "Клики",
      "ctr": "CTR",
      "cpm": "CPM",
      "sites": "Активные сайты",
      "pendingPayout": "Ожидаемая выплата",
      "recentActivity": "Недавняя активность",
      "earningsChart": "Обзор доходов",
      "topSites": "Топ сайты",
      "noSites": "Пока нет сайтов",
      "addSite": "Добавить первый сайт"
    }
  },
  "advertiser": {
    "nav": {
      "dashboard": "Панель",
      "campaigns": "Кампании",
      "creatives": "Креативы",
      "audiences": "Аудитории",
      "billing": "Биллинг",
      "statistics": "Статистика",
      "referrals": "Рефералы",
      "tracking": "Трекинг",
      "settings": "Настройки",
      "support": "Поддержка"
    },
    "dashboard": {
      "title": "Панель",
      "subtitle": "Обзор ваших кампаний",
      "totalSpent": "Всего потрачено",
      "todaySpent": "Потрачено сегодня",
      "activeCampaigns": "Активные кампании"
    }
  },
  "faq": {
    "title": "Часто задаваемые вопросы",
    "titleBrutalist": "F.A.Q.",
    "subtitle": "Найдите ответы на распространенные вопросы",
    "searchPlaceholder": "Поиск...",
    "notFound": "Вопросы не найдены.",
    "stillHaveQuestions": "Остались вопросы?",
    "stillHaveQuestionsSubtitle": "Не нашли ответ? Наша служба поддержки готова помочь.",
    "contactSupport": "Связаться с поддержкой →",
    "categories": {
      "all": "Все",
      "publishers": "Издатели",
      "advertisers": "Рекламодатели",
      "payments": "Выплаты",
      "technical": "Технические"
    },
    "questions": {
      "q1": "Сколько я могу заработать как издатель?",
      "a1": "Доходы варьируются от качества трафика. Мы предлагаем до 70% распределения доходов.",
      "q2": "Каковы минимальные требования для присоединения?",
      "a2": "Минимум 1,000 уникальных посетителей в день и легальный контент без нарушений авторских прав.",
      "q3": "Как установить код рекламы?",
      "a3": "После одобрения сайта скопируйте JS-код из панели и вставьте перед тегом </body>.",
      "q4": "Могу ли я использовать MrPop.io с Google AdSense?",
      "a4": "Да! MrPop.io на 100% совместим с Google AdSense.",
      "q5": "Каков минимальный депозит для рекламодателей?",
      "a5": "Минимальный депозит составляет $100 USD."
    }
  },
  "contact": {
    "title": "Свяжитесь с нами",
    "subtitle": "Есть вопросы? Мы здесь, чтобы помочь.",
    "nameLabel": "Полное имя",
    "namePlaceholder": "Иван Иванов",
    "emailLabel": "Email",
    "emailPlaceholder": "you@example.com",
    "subjectLabel": "Тема",
    "subjectPlaceholder": "Чем мы можем помочь?",
    "messageLabel": "Сообщение",
    "sendBtn": "Отправить сообщение"
  },
  "forPublishers": {
    "heroTitle": "Монетизируйте свой трафик",
    "heroSubtitle": "Присоединяйтесь к 10,000+ издателям, зарабатывающим до $8 CPM.",
    "heroCta": "Начать зарабатывать",
    "howTitle": "Как это работает",
    "steps": {
      "s1": "Регистрация",
      "s1Desc": "Создайте аккаунт за 2 минуты.",
      "s2": "Добавьте сайт",
      "s2Desc": "Отправьте сайт на проверку.",
      "s3": "Установите код",
      "s3Desc": "Скопируйте JS-код на свой сайт.",
      "s4": "Зарабатывайте",
      "s4Desc": "Получайте выплаты еженедельно."
    }
  },
  "forAdvertisers": {
    "heroTitle": "Охватите миллионы реальных пользователей",
    "heroSubtitle": "Трафик с 10,000+ премиум-сайтов. Начните кампанию от $100.",
    "heroCta": "Запустить кампанию",
    "formatsTitle": "Форматы рекламы"
  },
  "howItWorks": {
    "title": "Как работает MrPop.io",
    "forPublishers": "Для издателей",
    "forAdvertisers": "Для рекламодателей"
  }
};

async function main() {
  const targetPath = path.join(__dirname, 'messages', 'ru.json');
  let langJson = {};
  if (fs.existsSync(targetPath)) {
      langJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  }
  
  for(let key in ruTranslations) {
      langJson[key] = ruTranslations[key];
  }
  
  fs.writeFileSync(targetPath, JSON.stringify(langJson, null, 2));
  console.log('✅ RU subpages successfully injected into ru.json');
}

main();
