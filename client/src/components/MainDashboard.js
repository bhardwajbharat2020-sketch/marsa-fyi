// MainDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Star,
  Heart,
  CheckCircle,
  Ship,
  ShieldCheck,
  Globe,
  User,
  MapPin,
} from "lucide-react";
import WhatsAppButton from './WhatsAppButton';
import MusicPlayer from './MusicPlayer';
import ChatBot from './ChatBot';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import Translate from './Translate';

/*
  Theme colors used inline via hex:
  - bhagwa (saffron / highlight): #f77f00
  - cream base: #f6efe6 / cards bg: #efe6d9
  - deep/creamy dark text: #5a4632
*/

const heroSlides = [
  {
    id: 1,
    title: "Revolutionizing Global Trade",
    subtitle: "Connecting businesses across continents with trusted partnerships",
    image: "slider3.jpg",
    cta: "Explore Opportunities",
  },
  {
    id: 2,
    title: "Verified Suppliers Worldwide",
    subtitle: "Work with pre-verified partners for secure transactions",
    image: "slider2.jpeg",
    cta: "Find Suppliers",
  },
  {
    id: 3,
    title: "End-to-End Trade Solutions",
    subtitle: "From RFQ to delivery, we've got you covered",
    image: "main.jpg",
    cta: "Learn More",
  },
];

const categories = [
  { id: 1, name: "Land, house flat plot category", icon: "🏠", count: "5,230+" },
  { id: 2, name: "Electronics", icon: "🔌", count: "12,450+" },
  { id: 3, name: "Machinery", icon: "⚙️", count: "8,760+" },
  { id: 4, name: "Textiles", icon: "🧵", count: "15,230+" },
  { id: 5, name: "Chemicals", icon: "⚗️", count: "6,890+" },
  { id: 6, name: "Food & Beverages", icon: "🍎", count: "9,420+" },
  { id: 7, name: "Automotive", icon: "🚗", count: "7,560+" },
  { id: 8, name: "Construction", icon: "🏗️", count: "5,320+" },
  { id: 9, name: "Healthcare", icon: "⚕️", count: "4,890+" },
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

const MainDashboard = () => {
  const navigate = useNavigate();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const { t } = useTranslation();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // Keep your Supabase fetch logic unchanged
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/catalogs");
        const data = await response.json();
        if (response.ok) {
          setCatalogs(data);
        } else {
          setError(data.error || "Failed to fetch catalogs");
        }
      } catch (err) {
        setError("Failed to fetch catalogs");
        console.error("fetchCatalogs err:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, []);

  // hero auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((s) => (s === heroSlides.length - 1 ? 0 : s + 1));
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const handleRFQ = (catalogId) => {
    navigate("/login");
  };

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      if (countryOpen || languageOpen) {
        // Don't close if clicking on the dropdown buttons or their content
        const countryButton = document.querySelector('.country-selector-button');
        const languageButton = document.querySelector('.language-selector-button');
        const countryDropdown = document.querySelector('.country-dropdown');
        const languageDropdown = document.querySelector('.language-dropdown');
          
        const isClickOnCountry = countryButton?.contains(event.target) || countryDropdown?.contains(event.target);
        const isClickOnLanguage = languageButton?.contains(event.target) || languageDropdown?.contains(event.target);
          
        if (!isClickOnCountry && !isClickOnLanguage) {
          setCountryOpen(false);
          setLanguageOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [countryOpen, languageOpen]);

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
        <small><Translate text="portCentricB2B" /></small>
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
                style={{ width: 130, height: 60, borderRadius: 0, border: 'none' }}
                className="flex items-center justify-center text-white font-bold text-lg"
              />
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]"><Translate text="home" /></button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]"><Translate text="about" /></button>
              <button onClick={() => navigate("/shop")} className="hover:text-[#8b5f3b]"><Translate text="shop" /></button>
              <button onClick={() => navigate("/contact")} className="font-semibold" style={{ color: bhagwa }}><Translate text="contact" /></button>
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
            <div className="relative">
              <button
                onClick={() => setCountryOpen(!countryOpen)}
                className="country-selector-button flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedCountry}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {countryOpen && (
                <div className="country-dropdown absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
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
            <div className="relative">
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="language-selector-button flex items-center gap-2 px-3 py-2 rounded-md font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
              >
                <Globe className="h-4 w-4" />
                <span>{languages.find(lang => lang.code === selectedLanguage)?.flag} {languages.find(lang => lang.code === selectedLanguage)?.name}</span>
                <svg className="w-3 h-3 ml-1 text-[#6b503d]" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#6b503d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {languageOpen && (
                <div className="language-dropdown absolute mt-2 left-0 w-44 rounded-md shadow-lg glass overflow-hidden z-40">
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

      {/* Hero */}
      <section className="relative h-[560px] container mx-auto px-4 mt-8">
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${heroSlides[currentSlide].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.6) saturate(0.9)",
          }}
        />
        <div className="relative z-10 rounded-2xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
             style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.06))" }}>
          <div className="max-w-2xl text-white animate-float">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ textShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
              {heroSlides[currentSlide].title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90">{heroSlides[currentSlide].subtitle}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 rounded-full font-bold"
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                {heroSlides[currentSlide].cta}
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-6 py-3 rounded-full font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: darkText }}
              >
                <Translate text="contactSales" />
              </button>
            </div>
          </div>

          {/* quick search card */}
          <div className="w-full md:w-96 p-4 rounded-xl shadow-md" style={{ backgroundColor: creamCard }}>
            <div className="text-sm font-semibold mb-2" style={{ color: darkText }}><Translate text="quickRfqSearch" /></div>
            <div className="flex gap-2">
              <input className="flex-1 px-3 py-2 rounded-md border border-transparent focus:outline-none" placeholder={t('searchProductsSuppliers')} />
              <button className="px-3 rounded-md" style={{ backgroundColor: bhagwa, color: "#fff" }}>
                <Search />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}><Translate text="portIntegration" /></div>
                <div className="text-xs text-[#8b6a4f]"><Translate text="liveEta" /></div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}><Translate text="supplierVerification" /></div>
                <div className="text-xs text-[#8b6a4f]"><Translate text="kycAudits" /></div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}><Translate text="customsSupport" /></div>
                <div className="text-xs text-[#8b6a4f]"><Translate text="paperworkClearance" /></div>
              </button>
              <button className="px-3 py-2 rounded-md text-left" style={{ backgroundColor: "#fff" }}>
                <div className="font-semibold" style={{ color: darkText }}><Translate text="securePayments" /></div>
                <div className="text-xs text-[#8b6a4f]"><Translate text="escrowTrade" /></div>
              </button>
            </div>
          </div>
        </div>

        {/* hero pagination dots */}
        <div className="relative z-20 flex justify-center gap-2 mt-4">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-8 h-2 rounded-full transition-all ${idx === currentSlide ? "scale-110" : "opacity-60"}`}
              style={{ backgroundColor: idx === currentSlide ? bhagwa : "#fff" }}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: darkText }}><Translate text="topCategories" /></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 relative group" style={{ backgroundColor: "#fff" }}>
              <div className="text-4xl">{cat.icon}</div>
              <div className="mt-2 font-semibold line-clamp-2" style={{ color: darkText }}>{cat.name}</div>
              <div className="text-xs mt-1 text-[#8b6a4f]">{cat.count} products</div>
              {/* Tooltip for full category name on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black bg-opacity-80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                <div className="relative">
                  <div className="text-center max-w-xs">
                    {cat.name}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black border-opacity-80"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Catalogs */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold" style={{ color: darkText }}><Translate text="featuredCatalogs" /></h3>
          <button onClick={() => navigate("/shop")} className="flex items-center gap-1 text-sm font-semibold" style={{ color: bhagwa }}>
            <Translate text="viewAll" /> <ChevronRight />
          </button>
        </div>

        {loading && <div className="py-8 text-center text-[#7a614a]">Loading catalogs...</div>}
        {error && <div className="py-8 text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map((c) => (
              <div key={c.id} className="rounded-2xl overflow-hidden shadow-md" style={{ backgroundColor: "#fff" }}>
                <div className="relative">
                  <img src={c.image} alt={c.title} className="w-full h-48 object-cover" />
                  {c.status === "approved" && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "#ffffffcc", color: darkText }}>
                      <CheckCircle className="h-4 w-4" style={{ color: "#2ecc71" }} />
                      <small className="font-semibold">Verified</small>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-lg" style={{ color: darkText }}>{c.title}</h4>
                  <p className="text-sm mt-2 text-[#7a614a] line-clamp-3">{c.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-sm text-[#8b6a4f]">
                      <div className="flex items-center gap-1"><Star className="h-4 w-4" style={{ color: "#f2c94c" }} /> <span className="font-semibold">4.5</span></div>
                      <div className="flex items-center gap-1"><Heart className="h-4 w-4" style={{ color: "#ef4444" }} /> <span>{c.likes || 0}</span></div>
                    </div>

                    <button onClick={() => handleRFQ(c.id)} className="px-4 py-2 rounded-full font-semibold" style={{ backgroundColor: bhagwa, color: "#fff" }}>
                      <Translate text="requestQuote" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Port-centric Features */}
      <section className="container mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold mb-6" style={{ color: darkText }}><Translate text="portCentricServices" /></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl" style={{ backgroundColor: creamCard }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: "#fff" }}><Ship className="h-6 w-6" /></div>
              <div>
                <div className="font-semibold" style={{ color: darkText }}>Logistics & Shipping</div>
                <div className="text-sm text-[#7a614a]">Integrated carriers & tracking</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: creamCard }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: "#fff" }}><ShieldCheck className="h-6 w-6" /></div>
              <div>
                <div className="font-semibold" style={{ color: darkText }}>Customs Clearance</div>
                <div className="text-sm text-[#7a614a]">Documentation & advisory</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: creamCard }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: "#fff" }}><Globe className="h-6 w-6" /></div>
              <div>
                <div className="font-semibold" style={{ color: darkText }}>Market Intelligence</div>
                <div className="text-sm text-[#7a614a]">Demand data & price signals</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl" style={{ backgroundColor: creamCard }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md" style={{ backgroundColor: "#fff" }}><CheckCircle className="h-6 w-6" /></div>
              <div>
                <div className="font-semibold" style={{ color: darkText }}>Supplier Verification</div>
                <div className="text-sm text-[#7a614a]">KYC, audits & ratings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container mx-auto px-4 mt-12 mb-12">
        <h3 className="text-2xl font-bold mb-6" style={{ color: darkText }}><Translate text="whyChooseMarsaFyi" /></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl" style={{ backgroundColor: "#fff" }}>
            <div className="font-semibold" style={{ color: darkText }}><Translate text="verifiedSuppliers" /></div>
            <p className="text-sm mt-2 text-[#7a614a]"><Translate text="verifiedSuppliersText" /></p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: "#fff" }}>
            <div className="font-semibold" style={{ color: darkText }}><Translate text="secureTransactions" /></div>
            <p className="text-sm mt-2 text-[#7a614a]"><Translate text="secureTransactionsText" /></p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: "#fff" }}>
            <div className="font-semibold" style={{ color: darkText }}><Translate text="globalReach" /></div>
            <p className="text-sm mt-2 text-[#7a614a]"><Translate text="globalReachText" /></p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: "#fff" }}>
            <div className="font-semibold" style={{ color: darkText }}><Translate text="support247" /></div>
            <p className="text-sm mt-2 text-[#7a614a]"><Translate text="support247Text" /></p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 mb-12">
        <div className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between" style={{ backgroundColor: bhagwa }}>
          <div className="text-white">
            <h4 className="text-2xl font-bold"><Translate text="readyToScale" /></h4>
            <p className="mt-2 text-white/90"><Translate text="readyToScaleText" /></p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-3">
            <button onClick={() => navigate("/register")} className="px-6 py-3 rounded-full font-bold" style={{ backgroundColor: "#fff", color: bhagwa }}>
              <Translate text="registerFree" />
            </button>
            <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-full font-semibold" style={{ backgroundColor: "#00000022", color: "#fff" }}>
              <Translate text="login" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <img 
              src="/logo2.png" 
              alt="MarsaFyi Logo" 
              style={{ width: 170, height: 100, borderRadius: 0, border: 'none' }}
              className="mb-3"
            />
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center md:text-left"><Translate text="portCentricB2B" /></p>

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

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="forBuyers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white"><Translate text="submitRfq" /></button></li>
              <li><button onClick={() => navigate("/shop")} className="hover:text-white"><Translate text="searchSuppliers" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="tradeAssurance" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="paymentOptions" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="forSuppliers" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white"><Translate text="displayProducts" /></button></li>
              <li><button onClick={() => navigate("/register")} className="hover:text-white"><Translate text="supplierMembership" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="learningCenter" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="successStories" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="company" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="aboutUs" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="contactUs" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="careers" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="press" /></button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg"><Translate text="support" /></div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="helpCenter" /></button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white"><Translate text="submitRequest" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="termsOfService" /></button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white"><Translate text="privacyPolicy" /></button></li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            <Translate text="copyrightText" year={new Date().getFullYear()} />
          </div>
        </div>
      </footer>
      <ChatBot />
      <WhatsAppButton />
      <MusicPlayer />
    </div>
  );
};

export default MainDashboard;
