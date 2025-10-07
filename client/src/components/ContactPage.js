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
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import WhatsAppButton from './WhatsAppButton';

/*
  Theme colors used inline via hex:
  - bhagwa (saffron / highlight): #f77f00
  - cream base: #f6efe6 / cards bg: #efe6d9
  - deep/creamy dark text: #5a4632
*/

const countries = ["Global", "India", "UAE", "China", "USA", "Germany", "UK", "Singapore"];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [countryOpen, setCountryOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus({ type: 'loading', message: 'Sending...' });

    // Submit to the new contact form endpoint
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setSubmitStatus({ type: 'success', message: data.message });
        setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
    });
  };

  // small helper for theme colors in inline style
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, color: darkText }}>
      {/* global small style additions (keyframes) */}
      <style>{`
        @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-in-down { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-slide-in-up { animation: slide-in-up 0.6s ease-out forwards; }
        .animate-slide-in-down { animation: slide-in-down 0.6s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .input-field:focus + .input-label, .input-field:not(:placeholder-shown) + .input-label { transform: translateY(-1.75rem) scale(0.8); color: ${bhagwa}; }
      `}</style>

      {/* ========================================================================================= */}
      {/* ========= UNTOUCHED HEADER START ======================================================== */}
      {/* ========================================================================================= */}

      {/* Top thin bar */}
      <div className="w-full text-center py-1" style={{ backgroundColor: "#f4e7d8", color: darkText }}>
        <small>Trusted port-centric B2B marketplace • Shipments | RFQs | Verified suppliers</small>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: cream }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2"
              onClick={() => navigate("/")}
              style={{ backgroundColor: creamCard }}
            >
              <div
                style={{ width: 44, height: 44, borderRadius: 10, background: bhagwa }}
                className="flex items-center justify-center text-white font-bold text-lg"
              >
                M
              </div>
              <div className="">
                <div className="text-xl font-bold" style={{ color: darkText }}>Marsa<span style={{ color: bhagwa }}>Fyi</span></div>
                <div className="text-xs" style={{ color: "#7a614a" }}>Port-centric Trade</div>
              </div>
            </div>

            {/* visible on desktop */}
            <nav className="hidden lg:flex items-center gap-6 ml-4 text-sm font-medium" style={{ color: "#6b503d" }}>
              <button onClick={() => navigate("/")} className="hover:text-[#8b5f3b]">Home</button>
              <button onClick={() => navigate("/about")} className="hover:text-[#8b5f3b]">About</button>
              <button onClick={() => navigate("/shop")} className="hover:text-[#8b5f3b]">Shop</button>
              <button onClick={() => navigate("/contact")} className="font-semibold" style={{ color: bhagwa }}>Contact</button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <input
                placeholder="Find products, suppliers, or ports..."
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
              Join / Login
            </button>

            <User className="h-6 w-6 text-[#6b503d]" />
          </div>
        </div>
      </header>

      {/* Country selector */}
      <div className="w-full border-t border-b" style={{ borderColor: "#eadfce" }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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
              <div className="absolute mt-2 left-0 w-44 rounded-md shadow-lg bg-white/50 backdrop-blur-md overflow-hidden z-40">
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

          <div className="text-sm" style={{ color: "#7a614a" }}>
            Serving <span className="font-semibold">{selectedCountry}</span> • Port-centric logistics & verified suppliers
          </div>
        </div>
      </div>

      {/* ======================================================================================= */}
      {/* ========= UNTOUCHED HEADER END ======================================================== */}
      {/* ======================================================================================= */}


      {/* ======================================================================================= */}
      {/* ========= CREATIVE & ANIMATED MIDDLE PART START ======================================= */}
      {/* ======================================================================================= */}
      
      {/* Redesigned Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-slide-in-down" style={{ color: darkText }}>
                Let's <span style={{ color: bhagwa }}>Connect</span> & Build Together.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '200ms', color: "#7a614a" }}>
                Whether you have a question, a project proposal, or just want to say hello, our team is ready to answer all your questions.
            </p>
        </div>
      </section>

      {/* Redesigned Contact Section */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 animate-scale-in" style={{ animationDelay: '400ms' }}>

          {/* Left Column: Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: creamCard }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: bhagwa }}>
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: darkText }}>Headquarters</h3>
                  <p className="mt-1 text-[#7a614a]">
                    123 Global Trade Center<br />Mumbai, Maharashtra 400001, India
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl" style={{ backgroundColor: creamCard }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: bhagwa }}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: darkText }}>Email Us</h3>
                  <p className="mt-1 text-[#7a614a]">
                    <a href="mailto:support@marsafyi.com" className="hover:underline">support@marsafyi.com</a><br/>
                    <a href="mailto:sales@marsafyi.com" className="hover:underline">sales@marsafyi.com</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: creamCard }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: bhagwa }}>
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: darkText }}>Call Us</h3>
                  <p className="mt-1 text-[#7a614a]">
                    +91 98765 43210 (India)<br/>
                    +1 (555) 123-4567 (International)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Form */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-3xl shadow-xl">
            <h2 className="text-4xl font-bold mb-8" style={{ color: darkText }}>Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Animated Form Fields with Floating Labels */}
              <div className="relative animate-slide-in-up" style={{ animationDelay: '500ms' }}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="input-field block w-full px-4 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors peer"
                  style={{ color: darkText }}
                />
                <label htmlFor="name" className="input-label absolute left-4 top-3 text-gray-500 transition-all duration-300 origin-top-left pointer-events-none">
                  Full Name
                </label>
              </div>

              <div className="relative animate-slide-in-up" style={{ animationDelay: '600ms' }}>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  className="input-field block w-full px-4 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors peer"
                  style={{ color: darkText }}
                />
                <label htmlFor="phone" className="input-label absolute left-4 top-3 text-gray-500 transition-all duration-300 origin-top-left pointer-events-none">
                  Phone Number (Optional)
                </label>
              </div>

              <div className="relative animate-slide-in-up" style={{ animationDelay: '700ms' }}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="input-field block w-full px-4 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors peer"
                   style={{ color: darkText }}
                />
                <label htmlFor="email" className="input-label absolute left-4 top-3 text-gray-500 transition-all duration-300 origin-top-left pointer-events-none">
                  Email Address
                </label>
              </div>

              <div className="relative animate-slide-in-up" style={{ animationDelay: '800ms' }}>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="input-field block w-full px-4 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors peer"
                   style={{ color: darkText }}
                />
                <label htmlFor="subject" className="input-label absolute left-4 top-3 text-gray-500 transition-all duration-300 origin-top-left pointer-events-none">
                  Subject
                </label>
              </div>

              <div className="relative animate-slide-in-up" style={{ animationDelay: '900ms' }}>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  rows="4"
                  className="input-field block w-full px-4 py-3 bg-transparent border-b-2 border-gray-200 focus:outline-none focus:border-orange-500 transition-colors resize-none peer"
                   style={{ color: darkText }}
                ></textarea>
                <label htmlFor="message" className="input-label absolute left-4 top-3 text-gray-500 transition-all duration-300 origin-top-left pointer-events-none">
                  Your Message
                </label>
              </div>

              <div className="animate-slide-in-up" style={{ animationDelay: '900ms' }}>
                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: bhagwa }}
                  disabled={submitStatus && submitStatus.type === 'loading'}
                >
                  {submitStatus && submitStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
            {submitStatus && submitStatus.type === 'success' && (
              <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800 animate-scale-in">
                {submitStatus.message}
              </div>
            )}
             {submitStatus && submitStatus.type === 'error' && (
              <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 animate-scale-in">
                {submitStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* ======================================================================================= */}
      {/* ========= CREATIVE & ANIMATED MIDDLE PART END ========================================= */}
      {/* ======================================================================================= */}


      {/* ======================================================================================= */}
      {/* ========= NEW EXTENDED SECTIONS START ================================================= */}
      {/* ======================================================================================= */}

      {/* Support Section */}
      <section className="py-24" style={{ backgroundColor: creamCard }}>
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: darkText }}>How Can We Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="text-5xl mb-6">❓</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: darkText }}>General Inquiries</h3>
              <p className="text-[#7a614a] mb-4 flex-grow">Have questions about our platform or services? Our team is here to help.</p>
              <a href="mailto:info@marsafyi.com" className="font-semibold" style={{ color: bhagwa }}>info@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="text-5xl mb-6">🛒</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: darkText }}>Buyer Support</h3>
              <p className="text-[#7a614a] mb-4 flex-grow">Need assistance with purchasing or finding products? Contact our buyer support.</p>
              <a href="mailto:buyers@marsafyi.com" className="font-semibold" style={{ color: bhagwa }}>buyers@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="text-5xl mb-6">🏪</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: darkText }}>Supplier Support</h3>
              <p className="text-[#7a614a] mb-4 flex-grow">Looking to sell on our platform? Get help with supplier onboarding.</p>
              <a href="mailto:suppliers@marsafyi.com" className="font-semibold" style={{ color: bhagwa }}>suppliers@marsafyi.com</a>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center">
              <div className="text-5xl mb-6">💼</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: darkText }}>Partnerships</h3>
              <p className="text-[#7a614a] mb-4 flex-grow">Interested in partnering with us? Let's explore opportunities together.</p>
              <a href="mailto:partnerships@marsafyi.com" className="font-semibold" style={{ color: bhagwa }}>partnerships@marsafyi.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: darkText }}>Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How do I register as a buyer?",
                answer: "Registration is simple and free. Click on the 'Join / Login' button in the header, select the 'Buyer' role, and follow the step-by-step registration process. You'll need to provide basic business information and verify your email address to get started."
              },
              {
                question: "What verification process do suppliers go through?",
                answer: "All our suppliers undergo a rigorous multi-stage verification that includes business registration checks, operational history, and product quality assessments. Verified suppliers receive a special badge on their profile, giving you confidence in every transaction."
              },
              {
                question: "How does the quotation and payment process work?",
                answer: "Once you find a product, you can request a quotation directly from the supplier. After agreeing on terms, all payments are processed through our secure gateway, which includes an escrow service. Funds are only released to the supplier after you confirm successful delivery."
              },
              {
                question: "Do you offer logistics and customs support?",
                answer: "Yes, we offer end-to-end logistics solutions. Our platform helps you connect with trusted freight forwarders and customs agents to ensure a smooth shipping and clearance process for your international orders."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b pb-6" style={{ borderColor: "#eadfce" }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: darkText }}>{faq.question}</h3>
                <p className="text-[#7a614a] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================================================= */}
      {/* ========= NEW EXTENDED SECTIONS END =================================================== */}
      {/* ======================================================================================= */}


      {/* ======================================================================================= */}
      {/* ========= UNTOUCHED FOOTER START ====================================================== */}
      {/* ======================================================================================= */}
      
      <footer className="mt-8" style={{ backgroundColor: "#2b2017", color: "#f8efe3" }}>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold mb-3">MarsaFyi</div>
            <p className="text-sm text-[#e6d8c6] max-w-sm mb-4 text-center md:text-left">Port-centric B2B marketplace connecting buyers, suppliers, and logistics partners globally.</p>

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
            <div className="font-semibold mb-3 text-lg">For Buyers</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white">Submit RFQ</button></li>
              <li><button onClick={() => navigate("/shop")} className="hover:text-white">Search Suppliers</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Trade Assurance</button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white">Payment Options</button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg">For Suppliers</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/login")} className="hover:text-white">Display Products</button></li>
              <li><button onClick={() => navigate("/register")} className="hover:text-white">Supplier Membership</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Learning Center</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Success Stories</button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg">Company</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/about")} className="hover:text-white">About Us</button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white">Contact Us</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Careers</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Press</button></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <div className="font-semibold mb-3 text-lg">Support</div>
            <ul className="text-sm text-[#e6d8c6] space-y-2">
              <li><button onClick={() => navigate("/contact")} className="hover:text-white">Help Center</button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white">Submit a Request</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Terms of Service</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white">Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "#3a2b20" }}>
          <div className="container mx-auto px-4 py-4 text-center text-sm text-[#e6d8c6]">
            © {new Date().getFullYear()} MarsaFyi • All rights reserved
          </div>
        </div>
      </footer>

      {/* ======================================================================================= */}
      {/* ========= UNTOUCHED FOOTER END ======================================================== */}
      {/* ======================================================================================= */}
      <WhatsAppButton />
    </div>
  );
};

export default ContactPage;

