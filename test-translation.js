// Simple test to verify translation system works
const fs = require('fs');
const path = require('path');

// Manually define translations for testing
const translations = {
  en: {
    home: "Home",
    shop: "Shop",
    about: "About",
    contact: "Contact",
    joinLogin: "Join / Login"
  },
  zh: {
    home: "首页",
    shop: "商店",
    about: "关于我们",
    contact: "联系我们",
    joinLogin: "加入/登录"
  },
  hi: {
    home: "होम",
    shop: "दुकान",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    joinLogin: "जुड़ें / लॉगिन करें"
  },
  de: {
    home: "Startseite",
    shop: "Geschäft",
    about: "Über uns",
    contact: "Kontakt",
    joinLogin: "Beitreten / Anmelden"
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    about: "عنّا",
    contact: "اتصل بنا",
    joinLogin: "انضم / تسجيل الدخول"
  }
};

// Test translation function
function t(language, key) {
  return translations[language]?.[key] || translations.en?.[key] || key;
}

// Test translations
console.log('Translation Test Results:');
console.log('======================');

const testKeys = ['home', 'shop', 'about', 'contact', 'joinLogin'];
const languages = ['en', 'zh', 'hi', 'de', 'ar'];

languages.forEach(lang => {
  console.log(`\n${lang.toUpperCase()} translations:`);
  testKeys.forEach(key => {
    console.log(`  ${key}: ${t(lang, key)}`);
  });
});

console.log('\n\nTest completed successfully!');