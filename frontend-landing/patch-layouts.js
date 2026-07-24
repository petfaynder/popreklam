const fs = require('fs');
const path = require('path');

const layouts = [
  'src/components/themes/brutalist/BrutalistLayout.js',
  'src/components/themes/saas/SaaSLayout.js',
  'src/components/themes/editorial/EditorialLayout.js',
  'src/components/themes/luminous/LuminousLayout.js',
  'src/components/themes/azure/AzureLayout.js',
];

layouts.forEach(layoutPath => {
  let c = fs.readFileSync(layoutPath, 'utf8');
  const fileName = path.basename(layoutPath);
  
  // 1. Add imports if not already present
  if (!c.includes("import LanguageSwitcher")) {
    c = c.replace(
      "import AuthNavButtons",
      "import LanguageSwitcher from '@/components/LanguageSwitcher';\nimport { useTranslations } from 'next-intl';\nimport AuthNavButtons"
    );
    // Fallback if AuthNavButtons import not found
    if (!c.includes("import LanguageSwitcher")) {
      // Try to add after the last import 
      const lastImportIdx = c.lastIndexOf('\nimport ');
      const afterLastImport = c.indexOf('\n', lastImportIdx + 1);
      c = c.substring(0, afterLastImport) + 
          "\nimport LanguageSwitcher from '@/components/LanguageSwitcher';\nimport { useTranslations } from 'next-intl';" + 
          c.substring(afterLastImport);
    }
  }
  
  // 2. Add useTranslations hook to Nav functions
  // Find the Nav function (e.g., BrutalistNav, SaaSNav, etc.)
  // Add useTranslations hook after the first useState/useEffect/const line in Nav
  const navFnNames = ['BrutalistNav', 'SaaSNav', 'EditorialNav', 'LuminousNav', 'AzureNav'];
  navFnNames.forEach(fnName => {
    if (c.includes(`function ${fnName}(`)) {
      if (!c.includes(`function ${fnName}(\n    const t = `)) {
        // Find the function body opening and add hook
        c = c.replace(
          new RegExp(`(function ${fnName}\\(\\)\\s*\\{\\r?\\n)`),
          `$1    const t = useTranslations('nav');\n`
        );
      }
    }
  });
  
  // 3. Convert navLinks array items
  // Replace { name: 'X', href: 'Y' } → { tKey: 'key', href: 'Y' }
  c = c.replace(
    /\{ name: 'Advertisers', href: '\/for-advertisers' \}/g,
    "{ tKey: 'advertisers', href: '/for-advertisers' }"
  );
  c = c.replace(
    /\{ name: 'Publishers', href: '\/for-publishers' \}/g,
    "{ tKey: 'publishers', href: '/for-publishers' }"
  );
  c = c.replace(
    /\{ name: 'How It Works', href: '\/how-it-works' \}/g,
    "{ tKey: 'howItWorks', href: '/how-it-works' }"
  );
  c = c.replace(
    /\{ name: 'FAQ', href: '\/faq' \}/g,
    "{ tKey: 'faq', href: '/faq' }"
  );
  c = c.replace(
    /\{ name: 'Contact', href: '\/contact' \}/g,
    "{ tKey: 'contact', href: '/contact' }"
  );
  
  // 4. Update nav map calls: l.name → t(l.tKey), key={l.name} → key={l.tKey}
  // Only in NAV map context (navigation links), not testimonials etc.
  // Use navLinks.map pattern to target specifically
  
  // 5. Replace navLinks.map render items - but be careful not to break testimonials
  // Testimonials use .map(t => ...) which is a different pattern
  
  // Pattern: navLinks.map(l => <Link key={l.name} ...>{l.name}</Link>)
  c = c.replace(
    /navLinks\.map\(l => <Link key=\{l\.name\}(.*?)\{l\.name\}<\/Link>/g,
    "navLinks.map(l => <Link key={l.tKey}$1{t(l.tKey)}</Link>"
  );
  
  // 6. Add LanguageSwitcher to desktop nav - after the divider before AuthNavButtons/Login
  // Pattern varies by theme, use a common insertion point
  
  // Brutalist: after divider
  c = c.replace(
    '                    <div className="w-0.5 h-6 bg-foreground mx-2"></div>\r\n                    <AuthNavButtons',
    '                    <div className="w-0.5 h-6 bg-foreground mx-2"></div>\r\n                    <LanguageSwitcher dark={false} />\r\n                    <AuthNavButtons'
  );
  // SaaS: before login link  
  c = c.replace(
    '                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>',
    '                    <LanguageSwitcher dark={true} />\r\n                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">{t("login")}</Link>'
  );
  // Editorial: after divider before login
  c = c.replace(
    '                    <div className="w-px h-5 bg-gray-300"></div>\r\n                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1A1A1A]">Login</Link>',
    '                    <div className="w-px h-5 bg-gray-300"></div>\r\n                    <LanguageSwitcher dark={false} />\r\n                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#1A1A1A]">{t("login")}</Link>'
  );
  // Luminous: before login
  c = c.replace(
    '                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>\r\n                    <Link href="/register" className="px-6 py-2.5 bg-lime-400',
    '                    <LanguageSwitcher dark={true} />\r\n                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">{t("login")}</Link>\r\n                    <Link href="/register" className="px-6 py-2.5 bg-lime-400'
  );
  // Azure: before login
  c = c.replace(
    '                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>\r\n                    <Link href="/register" className="px-6 py-2.5 bg-sky-500',
    '                    <LanguageSwitcher dark={true} />\r\n                    <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">{t("login")}</Link>\r\n                    <Link href="/register" className="px-6 py-2.5 bg-sky-500'
  );
  
  fs.writeFileSync(layoutPath, c);
  
  // Verify
  const v = fs.readFileSync(layoutPath, 'utf8');
  console.log(`\n${fileName}:`);
  console.log('  LanguageSwitcher:', (v.match(/<LanguageSwitcher/g) || []).length, 'uses');
  console.log('  navLinks.tKey:', (v.match(/tKey:/g) || []).length, 'uses');
  console.log('  t(l.tKey):', (v.match(/t\(l\.tKey\)/g) || []).length, 'uses');
  console.log('  l.name remaining:', (v.match(/l\.name/g) || []).length);
});

console.log('\n✅ All layouts patched!');
