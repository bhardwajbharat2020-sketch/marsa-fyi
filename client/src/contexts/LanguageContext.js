import React, { createContext, useContext, useState } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { selectedLanguage } = useLanguage();
  
  const t = (key) => {
    if (!key) return '';
    
    // Return translated text or fallback to English or key itself
    return translations[selectedLanguage]?.[key] || 
           translations.en?.[key] || 
           key;
  };
  
  return { t, selectedLanguage };
};

export const LanguageProvider = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const value = {
    selectedLanguage,
    setSelectedLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};