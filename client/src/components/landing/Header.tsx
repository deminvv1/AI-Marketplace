"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { usePathname as useRawPathname } from "next/navigation";

// ── Language switcher ─────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
];

function LangSwitcher({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();       // locale-stripped path (next-intl)
  const rawPathname = useRawPathname(); // full URL path with locale prefix
  const router = useRouter();           // next-intl router (sets NEXT_LOCALE cookie)

  // Detect current locale from raw URL (works without NextIntlClientProvider)
  const seg = rawPathname.split("/")[1];
  const locale = LANG_OPTIONS.some((l) => l.code === seg) ? seg : "en";
  const current = LANG_OPTIONS.find((l) => l.code === locale) ?? LANG_OPTIONS[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function switchLocale(code: string) {
    setOpen(false);
    router.push(pathname, { locale: code });
  }

  const borderColor = dark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)";
  const bg = dark ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.1)";
  const textCol = dark ? "#374151" : "rgba(255,255,255,0.9)";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-sm font-medium transition-colors"
        style={{ border: `1px solid ${borderColor}`, background: bg, color: textCol }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:block text-xs font-semibold uppercase tracking-wide">{current.code}</span>
        <ChevronDown size={11} className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{ background: "rgba(8,8,20,0.96)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <div className="p-1.5 grid grid-cols-1 gap-0.5 max-h-80 overflow-y-auto">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-colors hover:bg-white/10"
                style={{ color: l.code === current.code ? "#a78bfa" : "rgba(255,255,255,0.8)", fontWeight: l.code === current.code ? 600 : 400 }}
              >
                <span className="text-lg w-6 text-center">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                <span className="text-xs opacity-40 uppercase">{l.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubItem { title: string; desc: string; }
interface Category { name: string; sub: SubItem[]; }

const HIRE_CATEGORIES: Category[] = [
  {
    name: "AI & Automation",
    sub: [
      { title: "AI Developers", desc: "Custom AI-powered apps and features" },
      { title: "Machine Learning Engineers", desc: "Models that learn from your data" },
      { title: "Chatbot Developers", desc: "Conversational AI for support and sales" },
      { title: "Computer Vision Engineers", desc: "Image and video recognition systems" },
      { title: "NLP Engineers", desc: "Natural language processing solutions" },
      { title: "AI Integration Developers", desc: "Connect AI to your existing tools" },
      { title: "Automation Experts", desc: "Workflow automation with AI" },
      { title: "Prompt Engineers", desc: "Craft effective AI model prompts" },
      { title: "n8n / Make / Zapier Experts", desc: "No-code AI workflow automation" },
      { title: "AI Consultants", desc: "Strategic AI roadmap and guidance" },
    ],
  },
  {
    name: "Programming & Tech",
    sub: [
      { title: "Website Development", desc: "Build any website from scratch or template" },
      { title: "WordPress Developers", desc: "WordPress sites, plugins and themes" },
      { title: "Shopify Developers", desc: "Launch and customize Shopify stores" },
      { title: "Webflow Developers", desc: "No-code websites and landing pages" },
      { title: "Full-Stack Developers", desc: "End-to-end web application development" },
      { title: "Mobile App Developers", desc: "iOS, Android and React Native apps" },
      { title: "React / Next.js Developers", desc: "Modern, fast web applications" },
      { title: "Python Developers", desc: "Scripting, automation and backend tools" },
      { title: "Cybersecurity Specialists", desc: "Protect systems and data from threats" },
      { title: "Blockchain Developers", desc: "Web3, smart contracts and DeFi" },
    ],
  },
  {
    name: "Data Science & ML",
    sub: [
      { title: "Data Scientists", desc: "Extract insights from complex data" },
      { title: "ML Engineers", desc: "Build and deploy ML models" },
      { title: "Data Analysts", desc: "Transform raw data into decisions" },
      { title: "Data Engineers", desc: "Build scalable data pipelines" },
      { title: "NLP Engineers", desc: "Text analysis and language models" },
      { title: "Computer Vision Engineers", desc: "Image recognition and analysis" },
      { title: "BI & Power BI Analysts", desc: "Dashboards and business intelligence" },
      { title: "MLOps Engineers", desc: "ML model deployment and monitoring" },
      { title: "Quantitative Analysts", desc: "Statistical modeling and predictions" },
      { title: "AI Research Scientists", desc: "Cutting-edge ML research" },
    ],
  },
  {
    name: "Design & Creative",
    sub: [
      { title: "UI/UX Designers", desc: "Intuitive digital experiences" },
      { title: "Logo & Brand Designers", desc: "Marks and visual identities" },
      { title: "Graphic Designers", desc: "Visual assets for any format" },
      { title: "AI Image Generators", desc: "Create visuals with AI tools" },
      { title: "3D Designers & Modelers", desc: "3D assets and renders" },
      { title: "Motion Designers", desc: "Animated graphics and transitions" },
      { title: "Product Designers", desc: "Product UX from concept to launch" },
      { title: "AR/VR Designers", desc: "Immersive experiences and interfaces" },
      { title: "Presentation Designers", desc: "Decks that communicate and impress" },
      { title: "Web Designers", desc: "Conversion-focused website design" },
    ],
  },
  {
    name: "Marketing & Growth",
    sub: [
      { title: "SEO Specialists", desc: "Rank higher, drive organic traffic" },
      { title: "PPC & Google Ads Experts", desc: "Drive clicks and conversions" },
      { title: "Social Media Managers", desc: "Grow your social presence" },
      { title: "Email Marketers", desc: "Campaigns that convert" },
      { title: "Growth Hackers", desc: "Data-driven scaling strategies" },
      { title: "CRO Specialists", desc: "Convert more visitors into customers" },
      { title: "Content Marketers", desc: "Content strategy and execution" },
      { title: "Affiliate Marketing Experts", desc: "Build and manage affiliate programs" },
      { title: "Brand Strategists", desc: "Build a brand that stands out" },
      { title: "Lead Generation Specialists", desc: "Fill your pipeline with prospects" },
    ],
  },
  {
    name: "Writing & Content",
    sub: [
      { title: "Copywriters", desc: "Words that persuade and convert" },
      { title: "Technical Writers", desc: "Clear docs for complex topics" },
      { title: "AI Content Creators", desc: "Scale content with AI assistance" },
      { title: "Script Writers", desc: "Scripts for video, podcast, stage" },
      { title: "Ghostwriters", desc: "Your ideas, expertly written" },
      { title: "Blog & Article Writers", desc: "Research-backed content, any topic" },
      { title: "Grant Writers", desc: "Proposals that win funding" },
      { title: "Translators & Localizers", desc: "Reach global audiences" },
      { title: "Proofreaders & Editors", desc: "Sharp, polished writing" },
      { title: "Resume & LinkedIn Writers", desc: "Land interviews and opportunities" },
    ],
  },
  {
    name: "Video & Animation",
    sub: [
      { title: "Video Editors", desc: "Cut and polish video, any platform" },
      { title: "AI Video Generators", desc: "Create videos with generative AI" },
      { title: "Motion Graphics Artists", desc: "Animated graphics for video/social" },
      { title: "2D & 3D Animators", desc: "Characters, logos, explainers" },
      { title: "VFX Artists", desc: "Visual effects for film and video" },
      { title: "Voice Over Artists", desc: "Pro voice recording, any project" },
      { title: "Videographers", desc: "Shoot and produce professional video" },
      { title: "Subtitling & Captioning", desc: "Reach wider audiences with captions" },
      { title: "YouTube Channel Managers", desc: "Grow and manage YouTube channels" },
      { title: "Podcast Producers", desc: "Produce and edit podcast content" },
    ],
  },
  {
    name: "Industry Solutions",
    sub: [
      { title: "Healthcare AI Developers", desc: "Medical imaging, diagnostics and clinical AI" },
      { title: "FinTech & Algorithmic Trading AI", desc: "Risk analysis, fraud detection, trading bots" },
      { title: "Manufacturing & Industry 4.0", desc: "Predictive maintenance and quality control AI" },
      { title: "Legal AI & Document Processing", desc: "Contract analysis and legal automation" },
      { title: "Agriculture & Precision Farming AI", desc: "Crop analysis and yield prediction systems" },
      { title: "Energy & Smart Grid AI", desc: "Renewable energy and grid optimization" },
      { title: "Logistics & Route Optimization AI", desc: "Fleet management and supply chain AI" },
      { title: "Real Estate & PropTech AI", desc: "Property valuation and market analysis" },
      { title: "Retail & E-Commerce AI", desc: "Recommendation engines and pricing AI" },
      { title: "EdTech & Adaptive Learning AI", desc: "Tutoring systems and learning automation" },
    ],
  },
  {
    name: "Business & Support",
    sub: [
      { title: "Virtual Assistants", desc: "Reliable day-to-day business support" },
      { title: "Business Analysts", desc: "Connect data to business decisions" },
      { title: "Project Managers", desc: "Deliver projects on time and budget" },
      { title: "CRM Specialists", desc: "Salesforce, HubSpot and CRM automation" },
      { title: "ERP Consultants", desc: "SAP, Oracle, NetSuite integration" },
      { title: "Bookkeepers", desc: "Keep your books clean and current" },
      { title: "Data Entry Specialists", desc: "Fast, accurate data processing" },
      { title: "Customer Service Reps", desc: "Support your customers effectively" },
      { title: "HR & Recruitment AI", desc: "AI-powered hiring and talent assessment" },
      { title: "Legal Document Specialists", desc: "Contracts, compliance and document review" },
    ],
  },
];

const FIND_WORK_CATEGORIES: Category[] = [
  {
    name: "AI & Automation",
    sub: [
      { title: "Artificial Intelligence", desc: "Work on cutting-edge AI projects" },
      { title: "Machine Learning", desc: "Build and train ML models" },
      { title: "Natural Language Processing", desc: "Text analysis and language AI" },
      { title: "Computer Vision", desc: "Image and video recognition" },
      { title: "Chatbot Development", desc: "Build conversational AI products" },
      { title: "AI Integration", desc: "Connect AI to existing systems" },
      { title: "Process Automation", desc: "Automate workflows with AI" },
      { title: "Prompt Engineering", desc: "Optimize AI model performance" },
      { title: "Generative AI", desc: "Build with GPT, Claude, Stable Diffusion" },
      { title: "AI Consulting", desc: "Guide companies on AI strategy" },
    ],
  },
  {
    name: "Programming & Tech",
    sub: [
      { title: "Website Development", desc: "Build websites for clients" },
      { title: "WordPress", desc: "Sites, plugins and theme work" },
      { title: "Shopify", desc: "Customize and build Shopify stores" },
      { title: "Full-Stack Development", desc: "Build complete web applications" },
      { title: "Mobile Development", desc: "iOS, Android and React Native" },
      { title: "React / Next.js", desc: "Modern JavaScript frameworks" },
      { title: "Python", desc: "Scripting, automation and backend" },
      { title: "Cloud & DevOps", desc: "AWS, GCP, Azure, Docker, Kubernetes" },
      { title: "Cybersecurity", desc: "Protect systems and data" },
      { title: "Blockchain & Web3", desc: "Smart contracts, DeFi, NFTs" },
    ],
  },
  {
    name: "Data Science & ML",
    sub: [
      { title: "Data Science", desc: "Turn data into insights" },
      { title: "Machine Learning Engineering", desc: "Build production ML systems" },
      { title: "Data Analysis", desc: "Analyse and visualize data" },
      { title: "Data Engineering", desc: "Build data pipelines and warehouses" },
      { title: "NLP Engineering", desc: "Language understanding and generation" },
      { title: "Computer Vision", desc: "Visual recognition systems" },
      { title: "Business Intelligence", desc: "Dashboards and reporting" },
      { title: "MLOps", desc: "Deploy and monitor ML models" },
      { title: "Statistical Modeling", desc: "Predictive and prescriptive analytics" },
      { title: "AI Research", desc: "Advance the state of AI" },
    ],
  },
  {
    name: "Design & Creative",
    sub: [
      { title: "UI/UX Design", desc: "Design intuitive digital experiences" },
      { title: "Logo & Brand Design", desc: "Create iconic brand identities" },
      { title: "Graphic Design", desc: "Visual assets for any medium" },
      { title: "AI Art & Image Generation", desc: "Create art using AI tools" },
      { title: "3D Design & Modeling", desc: "3D assets and renders" },
      { title: "Motion Design", desc: "Animated graphics and transitions" },
      { title: "Product Design", desc: "User-centred product experiences" },
      { title: "AR/VR Design", desc: "Immersive experience design" },
      { title: "Presentation Design", desc: "Compelling slide decks" },
      { title: "Web Design", desc: "Beautiful, functional websites" },
    ],
  },
  {
    name: "Marketing & Growth",
    sub: [
      { title: "SEO", desc: "Improve organic search rankings" },
      { title: "Pay Per Click", desc: "Google, Bing and display ads" },
      { title: "Social Media Marketing", desc: "Build and engage audiences" },
      { title: "Email Marketing", desc: "Campaigns that convert" },
      { title: "Growth Hacking", desc: "Data-driven user acquisition" },
      { title: "Content Marketing", desc: "Strategy and execution" },
      { title: "Affiliate Marketing", desc: "Performance-based promotion" },
      { title: "Brand Strategy", desc: "Position your brand to win" },
      { title: "Marketing Automation", desc: "AI-powered campaign automation" },
      { title: "Lead Generation", desc: "Qualify and nurture prospects" },
    ],
  },
  {
    name: "Video & Animation",
    sub: [
      { title: "Video Editing", desc: "Edit and polish video content" },
      { title: "AI Video Generation", desc: "Create videos using generative AI" },
      { title: "Motion Graphics", desc: "Animated visuals for any format" },
      { title: "Animation", desc: "2D and 3D character animation" },
      { title: "VFX", desc: "Visual effects and compositing" },
      { title: "Voice Over", desc: "Professional narration and recording" },
      { title: "Videography", desc: "Shoot professional video content" },
      { title: "Subtitling", desc: "Captions and subtitle creation" },
      { title: "YouTube Management", desc: "Grow a YouTube channel" },
      { title: "Podcast Production", desc: "Audio editing and production" },
    ],
  },
  {
    name: "Writing & Content",
    sub: [
      { title: "Copywriting", desc: "Persuasive copy for ads and web" },
      { title: "Technical Writing", desc: "Docs, guides and API references" },
      { title: "AI-Assisted Content", desc: "Scale content output with AI" },
      { title: "Scriptwriting", desc: "Scripts for video, film and audio" },
      { title: "Ghostwriting", desc: "Write under another's name" },
      { title: "Blog Writing", desc: "Engaging articles and blog posts" },
      { title: "Translation", desc: "Reach global audiences" },
      { title: "Proofreading", desc: "Catch errors before publishing" },
      { title: "Creative Writing", desc: "Fiction, poetry and creative work" },
      { title: "Resume Writing", desc: "Help clients land interviews" },
    ],
  },
  {
    name: "Industry Solutions",
    sub: [
      { title: "Healthcare AI", desc: "Medical AI systems and health tech" },
      { title: "FinTech AI", desc: "Finance, trading and risk systems" },
      { title: "Manufacturing AI", desc: "Industry 4.0 and smart factories" },
      { title: "Legal AI", desc: "Legal tech and document automation" },
      { title: "Agriculture AI", desc: "Precision farming and crop AI" },
      { title: "Energy AI", desc: "Smart grid and renewable energy" },
      { title: "Logistics AI", desc: "Supply chain and route optimization" },
      { title: "Real Estate AI", desc: "PropTech and property analytics" },
      { title: "Retail AI", desc: "E-commerce and recommendation AI" },
      { title: "EdTech AI", desc: "Adaptive learning and tutoring AI" },
    ],
  },
  {
    name: "Business & Support",
    sub: [
      { title: "Virtual Assistance", desc: "Remote business support" },
      { title: "Business Analysis", desc: "Process improvement and insights" },
      { title: "Project Management", desc: "Deliver projects successfully" },
      { title: "CRM Management", desc: "Salesforce, HubSpot expertise" },
      { title: "Bookkeeping", desc: "Accounting and financial records" },
      { title: "Data Entry", desc: "Accurate data processing" },
      { title: "Customer Service", desc: "Support customers across channels" },
      { title: "HR & Recruitment", desc: "Hire and retain top talent" },
      { title: "Legal Support", desc: "Contracts and compliance assistance" },
      { title: "Research & Analysis", desc: "Market research and insights" },
    ],
  },
];

interface MegaMenuProps {
  categories: Category[];
  onClose: () => void;
  footerLinks?: { label: string; href: string }[];
}

function MegaMenu({ categories, onClose, footerLinks }: MegaMenuProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <div
      className="absolute top-full left-0 mt-0 bg-white rounded-b-xl shadow-2xl border border-gray-100 flex overflow-hidden"
      style={{ width: 700, zIndex: 200, marginTop: 1 }}
    >
      {/* Left: category list */}
      <div className="w-52 border-r border-gray-100 py-4 flex-shrink-0 bg-gray-50/50">
        <div className="px-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Categories
        </div>
        {categories.map((cat, idx) => (
          <button
            key={cat.name}
            className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-left transition-all"
            style={{
              background: activeIdx === idx ? "#fff" : "transparent",
              color: activeIdx === idx ? "#6366f1" : "#374151",
              fontWeight: activeIdx === idx ? 600 : 400,
              borderRight: activeIdx === idx ? "2px solid #6366f1" : "2px solid transparent",
            }}
            onMouseEnter={() => setActiveIdx(idx)}
          >
            {cat.name}
            <ChevronDown size={12} style={{ transform: "rotate(-90deg)", opacity: 0.4 }} />
          </button>
        ))}
      </div>

      {/* Right: sub-items */}
      <div className="flex-1 p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {categories[activeIdx].name}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {categories[activeIdx].sub.map((item) => (
            <Link
              key={item.title}
              href={`/browse?q=${encodeURIComponent(item.title)}`}
              onClick={onClose}
              className="block group"
            >
              <div className="text-sm font-semibold text-gray-800 group-hover:text-indigo-500 transition-colors leading-snug">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 leading-snug">{item.desc}</div>
            </Link>
          ))}
        </div>
        {footerLinks && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-5">
            {footerLinks.map((fl) => (
              <Link
                key={fl.label}
                href={fl.href}
                onClick={onClose}
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                {fl.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"hire" | "work" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openMenu = (menu: "hire" | "work") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menu);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(null);
  };

  const dark = scrolled || mobileOpen;
  const textCol = dark ? "#111827" : "#ffffff";


  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: dark ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: dark ? "blur(20px)" : "none",
        boxShadow: dark ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-5 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 select-none" style={{ textDecoration: "none" }}>
          {/* Brand mark — network graph symbolising connections */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#14a800"/>
            <circle cx="16" cy="9"  r="2.6" fill="white"/>
            <circle cx="9"  cy="23" r="2.6" fill="white"/>
            <circle cx="23" cy="23" r="2.6" fill="white"/>
            <line x1="16" y1="9"  x2="9"  y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="16" y1="9"  x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="9"  y1="23" x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          {/* Wordmark */}
          <div style={{ lineHeight: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.08rem",
                letterSpacing: "-0.03em",
                background: "linear-gradient(130deg, #14a800 0%, #00c4a0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >AI</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.08rem",
                letterSpacing: "-0.025em",
                color: dark ? "#111827" : "#ffffff",
                transition: "color 0.3s",
              }}
            >&nbsp;Marketplace</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 ml-4 flex-1">
          {/* Find Talent */}
          <div
            className="relative"
            onMouseEnter={() => openMenu("hire")}
            onMouseLeave={scheduleClose}
          >
            <button
              className="flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ color: textCol }}
            >
              {t("findTalent")}
              <ChevronDown
                size={13}
                style={{
                  opacity: 0.65,
                  transition: "transform 0.2s",
                  transform: activeMenu === "hire" ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {activeMenu === "hire" && (
              <div onMouseEnter={() => openMenu("hire")} onMouseLeave={scheduleClose}>
                <MegaMenu
                  categories={HIRE_CATEGORIES}
                  onClose={closeMenu}
                  footerLinks={[{ label: t("seeAllSkills"), href: "/hire" }]}
                />
              </div>
            )}
          </div>

          {/* Find Work */}
          <div
            className="relative"
            onMouseEnter={() => openMenu("work")}
            onMouseLeave={scheduleClose}
          >
            <button
              className="flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ color: textCol }}
            >
              {t("findWork")}
              <ChevronDown
                size={13}
                style={{
                  opacity: 0.65,
                  transition: "transform 0.2s",
                  transform: activeMenu === "work" ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {activeMenu === "work" && (
              <div onMouseEnter={() => openMenu("work")} onMouseLeave={scheduleClose}>
                <MegaMenu
                  categories={FIND_WORK_CATEGORIES}
                  onClose={closeMenu}
                  footerLinks={[
                    { label: t("browseAllProjects"), href: "/work" },
                    { label: t("createProfile"), href: "/register" },
                  ]}
                />
              </div>
            )}
          </div>

          <Link
            href="/why-ai-market"
            className="px-3.5 py-2 rounded-md text-sm font-medium"
            style={{ color: textCol }}
          >
            {t("whyAiMarket")}
          </Link>
        </nav>

        {/* Right actions - desktop */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <LangSwitcher dark={dark} />
          <Link
            href="/register?skip_role=1"
            className="text-sm font-medium px-3 py-2 rounded-md transition-colors"
            style={{ color: textCol }}
          >
            {t("logIn")}
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              boxShadow: "0 1px 8px rgba(99,102,241,0.45)",
            }}
          >
            {t("signUp")}
          </Link>
        </div>

        {/* Mobile: right side. Below 360px the sign-up pill is dropped — the
            language switcher and the burger alone already fill the row, and
            sign-up stays reachable from the drawer. */}
        <div className="flex lg:hidden items-center gap-1.5 min-[400px]:gap-2 ml-auto min-w-0">
          <LangSwitcher dark={dark} />
          <Link href="/register" className="hidden min-[360px]:inline-block text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {t("signUp")}
          </Link>
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="p-2 rounded-md transition-colors"
            style={{ color: textCol }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-1">
          {([
            { label: t("findTalent"),   href: "/hire" },
            { label: t("findWork"),     href: "/work" },
            { label: t("whyAiMarket"), href: "/why-ai-market" },
          ] as { label: string; href: string }[]).map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm font-medium text-gray-800 border-b border-gray-100"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 mt-3">
            <Link href="/register?skip_role=1" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700">
              {t("logIn")}
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {t("signUp")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
