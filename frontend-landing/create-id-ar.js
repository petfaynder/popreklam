const fs = require('fs');
const path = require('path');

const idTranslations = {
  "nav": {
    "advertisers": "Pengiklan",
    "publishers": "Penerbit",
    "howItWorks": "Cara Kerja",
    "faq": "FAQ",
    "contact": "Kontak",
    "blog": "Blog",
    "docs": "Dokumentasi",
    "login": "Masuk",
    "getStarted": "Mulai",
    "dashboard": "Dasbor",
    "logout": "Keluar",
    "subscribe": "Berlangganan"
  },
  "footer": {
    "platform": "Platform",
    "resources": "Sumber Daya",
    "company": "Perusahaan",
    "legal": "Hukum",
    "tagline": "Jaringan iklan berkinerja tinggi untuk penerbit dan pengiklan.",
    "taglineSaaS": "Jaringan iklan modern.",
    "taglineLuminous": "Monetisasi lebih cerdas.",
    "taglineAzure": "Jangkau audiens Anda dengan presisi.",
    "copyright": "© {year} MrPop.io",
    "links": {
      "adFormats": "Format Iklan",
      "smartLink": "Tautan Pintar",
      "antiAdblock": "Anti-Adblock",
      "howItWorks": "Cara Kerja",
      "blog": "Blog",
      "docs": "Dokumentasi",
      "contact": "Kontak",
      "faq": "FAQ",
      "status": "Status",
      "privacy": "Kebijakan Privasi",
      "terms": "Syarat Ketentuan",
      "publishers": "Penerbit",
      "advertisers": "Pengiklan"
    }
  },
  "common": {
    "save": "Simpan",
    "cancel": "Batal",
    "loading": "Memuat...",
    "error": "Terjadi kesalahan",
    "success": "Berhasil",
    "noData": "Tidak ada data",
    "retry": "Coba lagi",
    "close": "Tutup",
    "confirm": "Konfirmasi",
    "delete": "Hapus",
    "edit": "Edit",
    "view": "Lihat",
    "search": "Cari",
    "all": "Semua",
    "active": "Aktif",
    "status": "Status",
    "actions": "Tindakan",
    "date": "Tanggal",
    "amount": "Jumlah",
    "total": "Total",
    "name": "Nama",
    "email": "Email"
  },
  "auth": {
    "loginTitle": "Selamat datang kembali",
    "loginSubtitle": "Masuk ke akun MrPop.io Anda",
    "registerTitle": "Buat akun Anda",
    "registerSubtitle": "Bergabung dengan 10.000+ pengguna",
    "emailLabel": "Email",
    "passwordLabel": "Kata Sandi",
    "loginBtn": "Masuk",
    "registerBtn": "Daftar",
    "rolePublisher": "Penerbit",
    "roleAdvertiser": "Pengiklan",
    "roleLabel": "Saya seorang"
  },
  "publisher": {
    "nav": {
      "dashboard": "Dasbor",
      "analytics": "Analitik",
      "sites": "Situs",
      "payments": "Pembayaran",
      "settings": "Pengaturan"
    },
    "dashboard": {
      "title": "Dasbor",
      "totalEarnings": "Total Pendapatan",
      "impressions": "Tayangan",
      "clicks": "Klik",
      "ctr": "CTR",
      "cpm": "CPM"
    }
  },
  "advertiser": {
    "nav": {
      "dashboard": "Dasbor",
      "campaigns": "Kampanye",
      "billing": "Penagihan",
      "settings": "Pengaturan"
    },
    "dashboard": {
      "title": "Dasbor",
      "totalSpent": "Total Pengeluaran",
      "activeCampaigns": "Kampanye Aktif"
    }
  },
  "faq": {
    "title": "Pertanyaan yang Sering Diajukan",
    "titleBrutalist": "F.A.Q.",
    "subtitle": "Temukan jawaban untuk pertanyaan umum",
    "searchPlaceholder": "Cari...",
    "notFound": "Tidak ada pertanyaan ditemukan.",
    "categories": {
      "all": "Semua",
      "publishers": "Penerbit",
      "advertisers": "Pengiklan"
    },
    "questions": {
      "q1": "Berapa penghasilan saya?",
      "a1": "Penghasilan bervariasi berdasarkan kualitas lalu lintas.",
      "q2": "Apa saja persyaratannya?",
      "a2": "Minimal 1.000 pengunjung per hari.",
      "q3": "Bagaimana cara memasang kode?",
      "a3": "Salin dan tempel JavaScript sebelum tag body.",
      "q4": "Kompatibel dengan Google AdSense?",
      "a4": "Ya, 100% kompatibel."
    }
  },
  "contact": {
    "title": "Hubungi Kami",
    "nameLabel": "Nama Lengkap",
    "emailLabel": "Email",
    "subjectLabel": "Subjek",
    "messageLabel": "Pesan",
    "sendBtn": "Kirim Pesan"
  },
  "forPublishers": {
    "heroTitle": "Monetisasi Lalu Lintas Anda",
    "heroSubtitle": "Hingga $8 CPM. Pembayaran mingguan.",
    "heroCta": "Mulai Menghasilkan",
    "howTitle": "Cara Kerja",
    "steps": {
      "s1": "Daftar",
      "s2": "Tambahkan Situs",
      "s3": "Pasang Kode",
      "s4": "Dapatkan Uang"
    }
  },
  "forAdvertisers": {
    "heroTitle": "Jangkau Jutaan Pengguna",
    "heroSubtitle": "Lalu lintas premium. Mulai dari $100.",
    "heroCta": "Luncurkan Kampanye",
    "formatsTitle": "Format Iklan"
  },
  "howItWorks": {
    "title": "Cara Kerja MrPop.io",
    "forPublishers": "Untuk Penerbit",
    "forAdvertisers": "Untuk Pengiklan"
  }
};

const arTranslations = {
  "nav": {
    "advertisers": "المعلنون",
    "publishers": "الناشرون",
    "howItWorks": "كيف تعمل",
    "faq": "الأسئلة الشائعة",
    "contact": "اتصل بنا",
    "blog": "المدونة",
    "docs": "الوثائق",
    "login": "تسجيل الدخول",
    "getStarted": "ابدأ الآن",
    "dashboard": "لوحة القيادة",
    "logout": "تسجيل الخروج",
    "subscribe": "اشتراك"
  },
  "footer": {
    "platform": "المنصة",
    "resources": "الموارد",
    "company": "الشركة",
    "legal": "قانوني",
    "tagline": "شبكة إعلانات عالية الأداء للناشرين والمعلنين.",
    "copyright": "© {year} MrPop.io",
    "links": {
      "adFormats": "صيغ الإعلانات",
      "smartLink": "الرابط الذكي",
      "antiAdblock": "مضاد حظر الإعلانات",
      "howItWorks": "كيف تعمل",
      "blog": "المدونة",
      "docs": "الوثائق",
      "contact": "اتصل بنا",
      "faq": "الأسئلة الشائعة",
      "status": "الحالة",
      "privacy": "سياسة الخصوصية",
      "terms": "شروط الخدمة"
    }
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "loading": "جاري التحميل...",
    "error": "حدث خطأ ما",
    "success": "نجاح",
    "noData": "لا توجد بيانات",
    "close": "إغلاق",
    "search": "بحث",
    "all": "الكل"
  },
  "auth": {
    "loginTitle": "مرحباً بعودتك",
    "loginSubtitle": "تسجيل الدخول إلى حسابك",
    "registerTitle": "أنشئ حسابك",
    "emailLabel": "البريد الإلكتروني",
    "passwordLabel": "كلمة المرور",
    "loginBtn": "دخول",
    "registerBtn": "تسجيل",
    "rolePublisher": "ناشر",
    "roleAdvertiser": "معلن"
  },
  "publisher": {
    "nav": {
      "dashboard": "لوحة القيادة",
      "sites": "المواقع",
      "payments": "المدفوعات"
    },
    "dashboard": {
      "title": "لوحة القيادة",
      "totalEarnings": "إجمالي الأرباح"
    }
  },
  "faq": {
    "title": "الأسئلة الشائعة",
    "titleBrutalist": "أسئلة وأجوبة",
    "searchPlaceholder": "ابحث عن إجابات...",
    "questions": {
      "q1": "كم يمكنني أن أكسب؟",
      "a1": "تختلف الأرباح بناءً على جودة الزيارات.",
      "q3": "كيف أقوم بتثبيت الرمز؟",
      "a3": "انسخ والصق الكود قبل وسم body."
    }
  },
  "contact": {
    "title": "تواصل معنا",
    "sendBtn": "إرسال رسالة"
  },
  "forPublishers": {
    "heroTitle": "حقق أرباحًا من زياراتك",
    "heroCta": "ابدأ في الكسب",
    "howTitle": "كيف تعمل"
  },
  "forAdvertisers": {
    "heroTitle": "الوصول إلى ملايين المستخدمين",
    "heroCta": "إطلاق حملة"
  },
  "howItWorks": {
    "title": "كيف تعمل",
    "forPublishers": "للناشرين",
    "forAdvertisers": "للمعلن"
  }
};

async function main() {
  // Save ID
  const idPath = path.join(__dirname, 'messages', 'id.json');
  let idJson = {};
  if (fs.existsSync(idPath)) idJson = JSON.parse(fs.readFileSync(idPath, 'utf8'));
  for(let k in idTranslations) idJson[k] = idTranslations[k];
  fs.writeFileSync(idPath, JSON.stringify(idJson, null, 2));

  // Save AR
  const arPath = path.join(__dirname, 'messages', 'ar.json');
  let arJson = {};
  if (fs.existsSync(arPath)) arJson = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  for(let k in arTranslations) arJson[k] = arTranslations[k];
  fs.writeFileSync(arPath, JSON.stringify(arJson, null, 2));

  console.log('✅ ID and AR subpages translated!');
}

main();
