const fs = require('fs');
const path = require('path');

const data = {
  tr: {
    trustedBy: "10.000+ Yayıncı Tarafından Güveniliyor",
    heroTitleHtml: "TRAFİK <br /> <span class=\"text-primary italic\">PARAYLA</span> <br /> BULUŞUYOR",
    heroDesc: "Ciddi yayıncılar için tasarlanmış en yüksek ödemeli reklam ağı. Yapay zeka destekli hedefleme, %100 doluluk oranı, haftalık ödemeler.",
    startEarning: "Kazanmaya Başla →",
    launchAds: "Reklam Ver",
    marquee: {
      highCpm: "★ YÜKSEK CPM ORANLARI",
      weekly: "★ HAFTALIK ÖDEMELER",
      fill: "★ %100 DOLULUK ORANI",
      antiAdblock: "★ ANTI-ADBLOCK",
      realtime: "★ GERÇEK ZAMANLI İSTATİSTİKLER",
      geos: "★ 248 ÜLKE"
    },
    stats: {
      fillRate: { label: "Doluluk Oranı", desc: "Her gösterim paraya dönüşür, her ülke kapsanır." },
      avgCpm: { label: "Ort. CPM", desc: "Tier-1 trafiğiniz hak ettiğini kazanır." },
      payouts: { label: "Ödemeler", desc: "BTC, USDT, PayPal, Banka. Her zaman zamanında." },
      geos: { label: "Ülke", desc: "Doğrudan reklamverenlerden global kapsama." }
    },
    forPublishers: {
      titleHtml: "YAYINCILAR<br />İÇİN",
      desc: "Her gösterimden elde ettiğiniz geliri en üst düzeye çıkarın. Yapay zeka ile optimize edilmiş reklam akışımız temiz ve güvenli reklamlarla en yüksek eCPM oranlarını sunar.",
      b1: "%70'e varan gelir paylaşımı",
      b2: "6 yüksek etkili reklam formatı",
      b3: "$5 minimum ödeme",
      b4: "Özel hesap yöneticisi",
      b5: "Anti-adblock çözümü",
      cta: "Yayıncı Olarak Katıl"
    },
    forAdvertisers: {
      titleHtml: "REKLAMVERENLER<br />İÇİN",
      desc: "248 ülkede yüksek etkileşimli kitlelere ulaşın. 20'den fazla hedefleme ayarı, akıllı teklif ve gerçek zamanlı analizler.",
      b1: "Doğrudan yayıncı trafiği",
      b2: "Gelişmiş Ülke/Cihaz/İS hedefleme",
      b3: "Akıllı CPM ve EBM Hedefi",
      b4: "$100 minimum bakiye yükleme",
      b5: "3 aşamalı sahtekarlık koruması",
      cta: "Kampanya Başlat"
    },
    adFormats: {
      titleHtml: "Dönüşüm Sağlayan <br /><span class=\"text-outline text-foreground\">Reklam Formatları</span>",
      desc: "Tüm cihazlarda ayda 2 milyardan fazla gösterim sunan, rahatsız edici olmayan yüksek performanslı reklam birimleri.",
      popunder: { title: "Popunder", desc: "Ana pencerenin arkasında tam sayfa reklamlar. En yüksek CPM oranları, sıfır banner körlüğü." },
      push: { title: "In-Page Push", desc: "Tarayıcı dostu bildirimler. İzin gerektirmez. Web push'a göre 30 kat daha yüksek TO." },
      interstitial: { title: "Geçiş Reklamı (Interstitial)", desc: "Sayfalar arasında tam ekran kaplama. Maksimum görsel etki ve etkileşim." },
      smartLink: { title: "Akıllı Link", desc: "Yapay zeka trafiği en yüksek ödemeli teklife yönlendirir. Sosyal medya trafiği için en iyisi." },
      native: { title: "Doğal (Native) Reklam", desc: "Site içeriğiyle kusursuz uyum sağlar. Yayıncılar renkleri, boyutları ve yerleşimi kontrol eder." },
      banner: { title: "Banner Reklamları", desc: "Klasik IAB standartları. Masaüstü ve mobil için istikrarlı karlar." }
    },
    whyUs: {
      title: "Neden 10.000+ Ortak Bize Güveniyor?",
      safety: { title: "Reklam Güvenliği ve Kalitesi", desc: "3 aşamalı güvenlik sistemi kötü amaçlı yazılımları, sahtekarlığı ve bot trafiğini engeller. Kullanıcılarınıza sadece temiz reklamlar ulaşır." },
      care: { title: "Ortak Destek", desc: "Destekten daha fazlası. Özel yöneticiler kampanyaları optimize etmeye ve gelirinizi büyütmeye yardımcı olur." },
      tools: { title: "Performans Araçları", desc: "Akıllı CPM, EBM Hedefi, Trafik Tahmin Edici. Teklifleri otomatikleştirin ve yapay zekanın en iyi yerleşimleri bulmasına izin verin." },
      global: { title: "Küresel Kapsama", desc: "248 ülkeden doğrudan yayıncılar. Her bölge için rekabetçi fiyatlarla Tier-1'den Tier-3'e premium trafik." },
      ecpm: { title: "Rekabetçi eCPM", desc: "eCPM modelimiz kaliteyi ödüllendirir. Daha fazla tıklama ve dönüşüm = daha yüksek kazanç." },
      payouts: { title: "Hızlı Ödemeler", desc: "$5 minimum ödeme tutarı. PayPal, USDT, Bitcoin, Banka Transferi ve daha fazlasıyla otomatik haftalık ödemeler." }
    },
    steps: {
      title: "4 Adımda Başlayın",
      s1: { title: "Kayıt Ol", desc: "Hesabınızı 2 dakikanın altında oluşturun. Onay gecikmesi yok." },
      s2: { title: "Sitenizi Ekleyin", desc: "Web sitenizi veya trafik kaynağınızı hızlı doğrulama için gönderin." },
      s3: { title: "Reklam Kodunu Alın", desc: "Hafif JavaScript etiketimizi kopyalayın. Sadece tek satır kod." },
      s4: { title: "Para Kazanın", desc: "Gelirinizin gerçek zamanlı olarak artışını izleyin. Haftalık ödeme alın." }
    },
    testimonials: {
      title: "Ortaklarımız Ne Diyor?",
      t1: { name: "Alex M.", role: "Yayıncı • Oyun Nişi", "quote": "AdSense'den MrPop.io'ya geçtim. Gelirim ilk ayda kelimenin tam anlamıyla üç katına çıktı. Sadece anti-adblock özelliği kaybedilen gelirin %30'unu geri kazandırdı." },
      t2: { name: "Sarah K.", role: "Medya Satın Alıcı • E-Ticaret", quote: "Hedefleme detayları inanılmaz. İşletim sistemi sürümüne ve operatöre kadar inebiliyorum. EBM Hedefi kampanyalarımı otomatik optimize ederek binlerce dolar tasarruf sağladı." },
      t3: { name: "Dmitri V.", role: "Yayıncı • Teknoloji Blogu", quote: "USDT ile haftalık ödemeler. Gecikme yok, bahane yok. Hesap yöneticim reklam yerleşimlerini optimize etmeme yardımcı oldu ve %40 daha fazla gelir sağladı." }
    },
    faq: {
      title: "SSS",
      q1: { q: "Ne kadar kazanabilirim?", a: "Yayıncı kazançları trafik kalitesine ve ülkeye göre değişir. Tier-1 trafiği (ABD, İngiltere, Kanada) $5-8+ CPM kazanabilir. eCPM modelimiz kaliteyi ödüllendirir — daha fazla tıklama ve dönüşüm, limitsiz daha yüksek kazanç demektir." },
      q2: { q: "Minimum ödeme tutarı nedir?", a: "Paxum ile sadece $5. PayPal, Banka Transferi ve USDT gibi yöntemlerin minimum tutarları biraz daha yüksektir. Ödemeler haftalık olarak, her zaman zamanında işlenir." },
      q3: { q: "Hangi reklam formatlarını destekliyorsunuz?", a: "Popunder, In-Page Push, Interstitial, Smart Link, Native Ads ve Banner Reklamlarını destekliyoruz. Maksimum gelir için birden fazla formatı aynı anda çalıştırabilirsiniz." },
      q4: { q: "Sahtekarlık koruması nasıl çalışır?", a: "Kendi geliştirdiğimiz 3 aşamalı güvenlik sistemimiz bot trafiğini, kötü amaçlı yazılımları ve sahte tıklamaları gerçek zamanlı olarak tespit edip engeller." },
      q5: { q: "Hangi hedefleme seçenekleri mevcut?", a: "Ülke, Şehir, İS, Tarayıcı, Cihaz Türü, Operatör, Dil ve daha fazlası dahil olmak üzere 20+ hedefleme ayarı." }
    },
    cta: {
      bgText: "ŞİMDİ BİZE KATIL",
      title1: "Hükmetmeye",
      title2: "Hazır mısın?",
      subtitle: "Bizimle ölçeklenen 10.000+ yayıncı ve reklamverene katıl.",
      publisher: "Yayıncı Kaydı",
      advertiser: "Reklamveren Kaydı"
    }
  },
  ru: {
    trustedBy: "Нам доверяют 10,000+ издателей",
    heroTitleHtml: "ТРАФИК <br /> <span class=\"text-primary italic\">ВСТРЕЧАЕТСЯ С</span> <br /> ДЕНЬГАМИ",
    heroDesc: "Самая высокооплачиваемая рекламная сеть для серьезных издателей. ИИ-таргетинг, 100% выкуп, еженедельные выплаты.",
    startEarning: "Начать зарабатывать →",
    launchAds: "Запустить рекламу",
    marquee: {
      highCpm: "★ ВЫСОКИЕ СТАВКИ CPM",
      weekly: "★ ЕЖЕНЕДЕЛЬНЫЕ ВЫПЛАТЫ",
      fill: "★ 100% ВЫКУП",
      antiAdblock: "★ АНТИ-ADBLOCK",
      realtime: "★ СТАТИСТИКА В РЕАЛЬНОМ ВРЕМЕНИ",
      geos: "★ 248 СТРАН"
    },
    stats: {
      fillRate: { label: "Выкуп", desc: "Каждый показ монетизируется, каждая страна покрыта." },
      avgCpm: { label: "Средний CPM", desc: "Трафик Tier-1 зарабатывает то, что он заслуживает." },
      payouts: { label: "Выплаты", desc: "BTC, USDT, PayPal, Wire. Всегда вовремя." },
      geos: { label: "ГЕО", desc: "Глобальное покрытие от прямых рекламодателей." }
    },
    forPublishers: {
      titleHtml: "ДЛЯ<br />ИЗДАТЕЛЕЙ",
      desc: "Максимизируйте доход с каждого показа. Наш ИИ-оптимизированный фид предоставляет самые высокие ставки eCPM с чистой и безопасной рекламой.",
      b1: "До 70% распределения доходов",
      b2: "6 высокоэффективных форматов",
      b3: "$5 минимальная выплата",
      b4: "Персональный менеджер",
      b5: "Решение Анти-Adblock",
      cta: "Присоединиться как издатель"
    },
    forAdvertisers: {
      titleHtml: "ДЛЯ<br />РЕКЛАМОДАТЕЛЕЙ",
      desc: "Охватите целевую аудиторию в 248 ГЕО. 20+ настроек таргетинга, умные ставки и аналитика в реальном времени.",
      b1: "Прямой трафик от издателей",
      b2: "Продвинутый таргетинг ГЕО/Устройство/ОС",
      b3: "Умный CPM и Цель CPA",
      b4: "$100 минимальный депозит",
      b5: "3-уровневая защита от фрода",
      cta: "Запустить кампанию"
    },
    adFormats: {
      titleHtml: "Форматы Рекламы <br /><span class=\"text-outline text-foreground\">Которые Конвертят</span>",
      desc: "Ненавязчивые, высокоэффективные рекламные блоки, обслуживающие более 2 млрд показов в месяц на всех устройствах.",
      popunder: { title: "Popunder", desc: "Реклама на всю страницу за главным окном. Самые высокие ставки CPM, нулевая баннерная слепота." },
      push: { title: "In-Page Push", desc: "Уведомления прямо в браузере. Не требует подписки. CTR в 30 раз выше, чем у веб-пушей." },
      interstitial: { title: "Interstitial", desc: "Полноэкранное перекрытие между страницами. Максимальный визуальный эффект." },
      smartLink: { title: "Smart Link", desc: "ИИ направляет на самое прибыльное предложение. Лучше всего для социального трафика." },
      native: { title: "Нативная Реклама", desc: "Органично вписывается в контент сайта. Полный контроль над цветами, размерами и размещением." },
      banner: { title: "Баннерная Реклама", desc: "Классические стандарты IAB. Стабильная прибыль для десктопа и мобильных устройств." }
    },
    whyUs: {
      title: "Почему нам доверяют 10,000+ партнеров",
      safety: { title: "Безопасность и Качество", desc: "3-уровневая система безопасности предотвращает вредоносное ПО, фрод и бот-трафик." },
      care: { title: "Забота о Партнерах", desc: "Больше, чем поддержка. Выделенные менеджеры помогают оптимизировать кампании и увеличивать доход." },
      tools: { title: "Инструменты Производительности", desc: "Smart CPM, Цель CPA, Оценщик Трафика. Автоматизируйте ставки и позвольте ИИ найти лучшее размещение." },
      global: { title: "Глобальное Покрытие", desc: "Прямые издатели из 248 ГЕО. Премиум-трафик с конкурентными ставками для каждого региона." },
      ecpm: { title: "Конкурентоспособный eCPM", desc: "Наша модель eCPM вознаграждает качество. Больше кликов и конверсий = выше заработок." },
      payouts: { title: "Быстрые Выплаты", desc: "$5 минимальная выплата. Автоматические еженедельные платежи через PayPal, USDT, Bitcoin, Wire Transfer и др." }
    },
    steps: {
      title: "Начните за 4 шага",
      s1: { title: "Регистрация", desc: "Создайте аккаунт менее чем за 2 минуты. Без задержек на одобрение." },
      s2: { title: "Добавьте Ваш Сайт", desc: "Отправьте ваш веб-сайт или источник трафика для быстрой верификации." },
      s3: { title: "Получите Код", desc: "Скопируйте наш легкий JavaScript-тег. Всего одна строка кода." },
      s4: { title: "Зарабатывайте", desc: "Следите за ростом дохода в реальном времени. Получайте выплаты еженедельно." }
    },
    testimonials: {
      title: "Что говорят партнеры",
      t1: { name: "Alex M.", role: "Издатель • Игровая ниша", quote: "Перешел с AdSense на MrPop.io. Мой доход буквально утроился в первый месяц. Только анти-adblock вернул 30% потерянного дохода." },
      t2: { name: "Sarah K.", role: "Медиабайер • E-Commerce", quote: "Детализация таргетинга сумасшедшая. Цель CPA сэкономила мне тысячи, автоматически оптимизируя кампании." },
      t3: { name: "Dmitri V.", role: "Издатель • Техноблог", quote: "Еженедельные выплаты через USDT. Без задержек, без отговорок. Мой менеджер помог увеличить доход на 40%." }
    },
    faq: {
      title: "FAQ",
      q1: { q: "Сколько я могу заработать?", a: "Заработок зависит от качества трафика и ГЕО. Трафик Tier-1 (США, Великобритания, Канада) может зарабатывать $5-8+ CPM." },
      q2: { q: "Какой минимальный порог выплаты?", a: "Всего $5 через Paxum. Другие методы, такие как PayPal, Wire и USDT, имеют чуть более высокий минимум." },
      q3: { q: "Какие форматы рекламы вы поддерживаете?", a: "Мы поддерживаем Popunder, In-Page Push, Interstitial, Smart Link, Native Ads и Баннерную рекламу." },
      q4: { q: "Как работает защита от фрода?", a: "Наша 3-уровневая система безопасности выявляет и блокирует бот-трафик и вредоносное ПО в реальном времени." },
      q5: { q: "Какие опции таргетинга доступны?", a: "20+ настроек таргетинга, включая Страну, Город, ОС, Браузер, Тип Устройства, Оператора связи и Язык." }
    },
    cta: {
      bgText: "ПРИСОЕДИНЯЙТЕСЬ",
      title1: "Готовы",
      title2: "Доминировать?",
      subtitle: "Присоединяйтесь к 10,000+ издателям и рекламодателям.",
      publisher: "Регистрация Издателя",
      advertiser: "Регистрация Рекламодателя"
    }
  }
};

const locales = ['tr', 'ru'];

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
