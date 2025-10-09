import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Search, MapPin, ArrowLeft, Globe } from 'lucide-react';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import Translate from './Translate';
import '../App.css';

const categories = [
  { id: 1, name: 'Land, house flat plot category', icon: '🏠' },
  { id: 2, name: 'Industrial Plants, Machinery & Equipment', icon: '🏭' },
  { id: 3, name: 'Consumer Electronics & Household Appliances', icon: '📺' },
  { id: 4, name: 'Industrial & Engineering Products, Spares and Supplies', icon: '🔩' },
  { id: 5, name: 'Building Construction Material & Equipment', icon: '🏗️' },
  { id: 6, name: 'Apparel, Clothing & Garments', icon: '👕' },
  { id: 7, name: 'Vegetables, Fruits, Grains, Dairy Products & FMCG', icon: '🍎' },
  { id: 8, name: 'Medical, Pharma, Surgical & Healthcare', icon: '⚕️' },
  { id: 9, name: 'Packaging Material, Supplies & Machines', icon: '📦' },
  { id: 10, name: 'Chemicals, Dyes & Allied Products', icon: '⚗️' },
  { id: 11, name: 'Kitchen Containers, Utensils & Cookware', icon: '🍳' },
  { id: 12, name: 'Textiles, Yarn, Fabrics & Allied Industries', icon: '🧵' },
  { id: 13, name: 'Books, Notebooks, Stationery & Publications', icon: '📚' },
  { id: 14, name: 'Cosmetics, Toiletries & Personal Care Products', icon: '🧴' },
  { id: 15, name: 'Home Furnishings and Home Textiles', icon: '🛋️' },
  { id: 16, name: 'Gems, Jewellery & Precious Stones', icon: '💎' },
  { id: 17, name: 'Computers, Software, IT Support & Solutions', icon: '💻' },
  { id: 18, name: 'Fashion & Garment Accessories', icon: '👠' },
  { id: 19, name: 'Ayurvedic & Herbal Products', icon: '🌿' },
  { id: 20, name: 'Security Devices, Safety Systems & Services', icon: '🛡️' },
  { id: 21, name: 'Sports Goods, Games, Toys & Accessories', icon: '🏀' },
  { id: 22, name: 'Telecom Products, Equipment & Supplies', icon: '📡' },
  { id: 23, name: 'Stationery and Paper Products', icon: '文' },
  { id: 24, name: 'Bags, Handbags, Luggage & Accessories', icon: '👜' },
  { id: 25, name: 'Stones, Marble & Granite Supplies', icon: '🪨' },
  { id: 26, name: 'Railway, Shipping & Aviation Products', icon: '🚆' },
  { id: 27, name: 'Leather and Leather Products & Accessories', icon: '👢' },
  { id: 28, name: 'Electronics Components and Supplies', icon: '💡' },
  { id: 29, name: 'Electrical Equipment and Supplies', icon: '⚡' },
  { id: 30, name: 'Pharmaceutical Drugs & Medicines', icon: '💊' },
  { id: 31, name: 'Mechanical Components & Parts', icon: '⚙️' },
  { id: 32, name: 'Scientific, Measuring & Laboratory Instruments', icon: '🔬' },
  { id: 33, name: 'Furniture, Furniture Supplies & Hardware', icon: '🪑' },
  { id: 34, name: 'Fertilizers, Seeds, Plants & Animal Husbandry', icon: '🌱' },
  { id: 35, name: 'Automobiles, Spare Parts and Accessories', icon: '🚗' },
  { id: 36, name: 'Housewares, Home Appliances & Decorations', icon: '🏠' },
  { id: 37, name: 'Metals, Minerals, Ores & Alloys', icon: '🪙' },
  { id: 38, name: 'Tools, Machine Tools & Power Tools', icon: '🛠️' },
  { id: 39, name: 'Gifts, Crafts, Antiques & Handmade Decoratives', icon: '🎁' },
  { id: 40, name: 'Bicycles, Rickshaws, Spares and Accessories', icon: '🚲' }
];

const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

// Languages for port-centric countries
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* global small style additions (keyframes) */}
      <style>{`
        @keyframes floatUp { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .animate-float { animation: floatUp 600ms ease-out both; }
        .glass {
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35));
          backdrop-filter: blur(6px);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Top thin bar */}
      <div className="w-full text-center py-1" style={{ backgroundColor: "#f4e7d8", color: darkText }}>
        <small>Trusted port-centric B2B marketplace • Shipments | RFQs | Verified suppliers</small>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <img 
                src="/logo.png" 
                alt="MarsaFyi Logo" 
                style={{ width: 60, height: 60, borderRadius: 0, border: 'none' }}
                className="flex items-center justify-center text-white font-bold text-lg"
              />
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]"><Translate text="home" /></button>
              <button onClick={() => navigate("/shop")} className="hover:text-[#8b5f3b]"><Translate text="shop" /></button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]"><Translate text="about" /></button>
              <button onClick={() => navigate("/contact")} className="hover:text-[#8b5f3b]"><Translate text="contact" /></button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                placeholder={t('searchPlaceholder')}
                className="pl-4 pr-10 py-2 rounded-full border border-transparent focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#fff", color: darkText }}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5f3b]" />
            </div>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-full font-semibold"
              style={{ backgroundColor: bhagwa, color: "#fff" }}
            >
              <Translate text="joinLogin" />
            </button>

            <User className="h-6 w-6 text-[#6b503d]" />
          </div>
        </div>
      </header>

      {/* Country selector */}
      <div className="w-full border-t border-b" style={{ borderColor: "#eadfce" }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative" onMouseLeave={() => setCountryOpen(false)}>
              <button
                onMouseEnter={() => setCountryOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedCountry}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {countryOpen && (
                <div className="absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
                  {countries.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#fff2e6] ${selectedCountry === c ? "font-semibold" : ""}`}
                      style={{ color: darkText }}
                    >
                      {c === "Global" ? "🌍 Global" : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="relative" onMouseLeave={() => setLanguageOpen(false)}>
              <button
                onMouseEnter={() => setLanguageOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <Globe className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === selectedLanguage)?.flag} {languages.find(lang => lang.code === selectedLanguage)?.name}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {languageOpen && (
                <div className="absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLanguage(lang.code); setLanguageOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#fff2e6] ${selectedLanguage === lang.code ? "font-semibold" : ""}`}
                      style={{ color: darkText }}
                    >
                      <span className="mr-2">{lang.flag}</span> {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm" style={{ color: "#7a614a" }}>
            <Translate text="serving" /> <span className="font-semibold">{selectedCountry}</span> • <Translate text="portCentricLogistics" />
          </div>
        </div>
      </div>

      {/* Categories Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 mb-6 text-sm font-semibold"
            style={{ color: bhagwa }}
          >
            <ArrowLeft className="h-4 w-4" />
            <Translate text="back" />
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: darkText }}><Translate text="allProductCategories" /></h1>
            <p className="text-[#7a614a] max-w-2xl mx-auto"><Translate text="browseCategories" /></p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-center relative group"
                onClick={() => {
                  // Navigate to shop page with category filter
                  navigate(`/shop?category=${encodeURIComponent(category.name)}`);
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#f0e6d9] flex items-center justify-center mx-auto mb-4 text-2xl">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: darkText }}>{category.name}</h3>
                {/* Tooltip for full category name on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black bg-opacity-80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                  <div className="relative">
                    <div className="text-center max-w-xs">
                      {category.name}
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black border-opacity-80"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="MarsaFyi Logo" 
              style={{ width: 60, height: 60, borderRadius: 0, border: 'none' }}
              className="mb-3"
            />
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center"><Translate text="portCentricB2B" /></p>

            <div className="flex gap-3">
              {/* Instagram */}
              <a href="https://www.instagram.com/marsagroupbusiness?utm_source=qr&igsh=MWcxNWcwZTQzYnJ0" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.2" stroke="#f6efe6"/><circle cx="17.5" cy="6.5" r="0.6" fill="#f6efe6"/></svg>
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/share/1CjsjNy4AF/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="Facebook">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3V2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>

              {/* X (Twitter) */}
              <a href="https://x.com/MarsaGroup?t=lcCaLBHxnJiOjeAqzQzTlQ&s=09" target="_blank" rel="noopener noreferrer" aria-label="X" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="X">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 16.5 3c-2.72 0-4.92 2.3-4.92 5.13 0 .4.05.8.13 1.18A13 13 0 0 1 2 4.5s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5V5c0-.7.5-1.5 1-2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>

              {/* YouTube */}
              <a href="https://youtube.com/marsafyi" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-md hover:bg-[#3f2b1f]" title="YouTube">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22.5 6.2s-.2-1.6-.8-2.3c-.7-.9-1.4-.9-1.8-1C16.6 2.5 12 2.5 12 2.5h0s-4.6 0-7.9.4c-.4.1-1.1.1-1.8 1-.6.7-.8 2.3-.8 2.3S1 8 1 9.8v1.4C1 13 1.2 14.7 1.2 14.7s.2 1.6.8 2.3c.7.9 1.6.9 2 1 1.5.2 6.3.4 6.3.4s4.6 0 7.9-.4c.4-.1 1.1-.1 1.8-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.6v-1.4C23 8 22.5 6.2 22.5 6.2z" stroke="#f6efe6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 14.5V8.5l5 3-5 3z" fill="#f6efe6"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold mb-3"><Translate text="forBuyers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li><Translate text="submitRfq" /></li>
              <li><Translate text="searchSuppliers" /></li>
              <li><Translate text="tradeAssurance" /></li>
              <li><Translate text="paymentOptions" /></li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-semibold mb-3"><Translate text="forSuppliers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2 text-center">
              <li><Translate text="displayProducts" /></li>
              <li><Translate text="supplierMembership" /></li>
              <li><Translate text="learningCenter" /></li>
              <li><Translate text="successStories" /></li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            <Translate text="copyrightText" year={new Date().getFullYear()} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CategoriesPage;