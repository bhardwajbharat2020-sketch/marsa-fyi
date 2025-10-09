import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const Translate = ({ text }) => {
  const { t } = useTranslation();
  return <>{t(text)}</>;
};

export default Translate;