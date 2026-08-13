"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Search, Menu, X } from "lucide-react";

interface SubItem { title: string; desc: string; }
interface Category { name: string; sub: SubItem[]; }

const HIRE_CATEGORIES: Category[] = [
  {
    name: "AI & Automation",
    sub: [
      { title: "AI Video Creators & Editors", desc: "Generate and edit AI-powered video" },
      { title: "AI Integration Developers", desc: "Connect AI to your existing tools" },
      { title: "Chatbot Developers", desc: "Build AI for support and sales" },
      { title: "Machine Learning Engineers", desc: "Models that learn from your data" },
      { title: "AI Developers", desc: "Custom AI-powered apps and features" },
      { title: "Automation Experts", desc: "Streamline your business processes" },
      { title: "N8N Experts", desc: "No-code workflow automation" },
      { title: "Vibe Coders", desc: "Prototype and build rapidly with AI" },
      { title: "Claude Experts", desc: "Build with Anthropic's Claude" },
      { title: "AI Consultants", desc: "Strategic AI guidance for business" },
    ],
  },
  {
    name: "Development & IT",
    sub: [
      { title: "Full-Stack Developers", desc: "Front and back end development" },
      { title: "WordPress Developers", desc: "Build and maintain WordPress sites" },
      { title: "Web Developers", desc: "Build and maintain websites/apps" },
      { title: "Shopify Developers", desc: "Launch and customize Shopify stores" },
      { title: "Mobile App Developers", desc: "Native and cross-platform apps" },
      { title: "Webflow Developers", desc: "Build in Webflow, no code" },
      { title: "Front-End Developers", desc: "Pixel-perfect interfaces and UX" },
      { title: "Ecommerce Developers", desc: "Build stores that convert and scale" },
      { title: "React JS Developers", desc: "Fast, dynamic front ends with React" },
      { title: "Bubble.io Developers", desc: "No-code apps built on Bubble" },
    ],
  },
  {
    name: "Design & Creative",
    sub: [
      { title: "Logo Designers", desc: "Marks and identities that stick" },
      { title: "Graphic Designers", desc: "Visual assets for any format" },
      { title: "Web Designers", desc: "Conversion-focused web design" },
      { title: "Video Editors", desc: "Polished edits for any platform" },
      { title: "Photo Editors", desc: "Retouch, composite, and color work" },
      { title: "Adobe Photoshop Experts", desc: "Advanced image editing" },
      { title: "UX/UI Designers", desc: "Interfaces backed by user research" },
      { title: "Presentation Designers", desc: "Decks that communicate and impress" },
      { title: "Brand Identity Designers", desc: "Cohesive visual systems for brands" },
      { title: "3D Modelers & Rendering", desc: "3D assets, photorealistic renders" },
    ],
  },
  {
    name: "Marketing",
    sub: [
      { title: "Social Media Managers", desc: "Grow your social presence" },
      { title: "Google Ads Experts", desc: "Drive clicks and conversions" },
      { title: "SEO Experts", desc: "Rank higher, drive organic traffic" },
      { title: "Facebook Ads Experts", desc: "Targeted Facebook/Instagram ads" },
      { title: "Email Marketers", desc: "Email campaigns that convert" },
      { title: "Marketing Automation Consultants", desc: "Workflows that run without you" },
      { title: "Social Media Marketers", desc: "Content and strategy, all platforms" },
      { title: "Search Engine Marketers", desc: "Paid search strategy and execution" },
      { title: "Marketing Strategists", desc: "Planning for sustainable growth" },
      { title: "Lead Generation Specialists", desc: "Fill your pipeline with prospects" },
    ],
  },
  {
    name: "Data & Analytics",
    sub: [
      { title: "Data Analysts", desc: "Raw data into clear insights" },
      { title: "Data Scientists", desc: "Advanced modeling and prediction" },
      { title: "Data Engineers", desc: "Build the pipelines your data needs" },
      { title: "Data Visualization Specialists", desc: "Charts and dashboards that explain" },
      { title: "Business Analysts", desc: "Connect data to business decisions" },
      { title: "Data Mining Specialists", desc: "Find patterns in large datasets" },
      { title: "Power BI Specialists", desc: "Interactive Power BI reporting" },
      { title: "Quantitative Researchers", desc: "Analysis for complex research needs" },
    ],
  },
  {
    name: "Admin & Support",
    sub: [
      { title: "Virtual Assistants", desc: "Reliable day-to-day support" },
      { title: "Data Entry Specialists", desc: "Fast, accurate data processing" },
      { title: "Bookkeepers", desc: "Keep your books clean and current" },
      { title: "Microsoft Excel Experts", desc: "Formulas, dashboards, wrangling" },
      { title: "Cold Callers", desc: "Outreach that opens doors" },
      { title: "PowerPoint Producers", desc: "Presentations built to impress" },
      { title: "QuickBooks Contractors", desc: "Setup, cleanup, ongoing bookkeeping" },
      { title: "Personal Assistants", desc: "Day-to-day support so you can focus" },
      { title: "Appointment Setters", desc: "Calendars of qualified meetings" },
      { title: "Customer Service Representatives", desc: "Support your customers will notice" },
    ],
  },
  {
    name: "Writing & Content",
    sub: [
      { title: "Resume Writers", desc: "Resumes that get interviews" },
      { title: "Copywriters", desc: "Words that persuade and convert" },
      { title: "Creative Writers", desc: "Compelling stories for any audience" },
      { title: "Ghostwriters", desc: "Your ideas, expertly written" },
      { title: "Technical Writers", desc: "Clear docs for complex topics" },
      { title: "Script Writers", desc: "Scripts for video, podcast, stage" },
      { title: "Grant Writers", desc: "Proposals that win funding" },
      { title: "Editors", desc: "Sharp, polished writing every level" },
      { title: "Proofreaders", desc: "Catch every error before publish" },
    ],
  },
  {
    name: "Video & Audio",
    sub: [
      { title: "Video Editing", desc: "Cut and polish video, any platform" },
      { title: "Voice Over", desc: "Pro voice recording, any project" },
      { title: "Voice Acting", desc: "Bring characters and scripts alive" },
      { title: "Animation", desc: "Characters, logos, explainers" },
      { title: "Narration", desc: "Clear, engaging spoken content" },
      { title: "Subtitling", desc: "Add captions and subtitles to video" },
      { title: "Videography", desc: "Shoot and produce pro video" },
      { title: "Motion Graphics", desc: "Animated graphics for video/social" },
      { title: "Audio Production", desc: "Record, mix, and master audio" },
      { title: "Podcasting", desc: "Produce and edit podcast content" },
    ],
  },
];

const FIND_WORK_CATEGORIES: Category[] = [
  {
    name: "AI & Automation",
    sub: [
      { title: "Artificial Intelligence", desc: "Work on cutting-edge AI projects" },
      { title: "AI Generated Video", desc: "Create AI-powered video content" },
      { title: "AI Model Training", desc: "Label, train and fine-tune AI models" },
      { title: "Prompt Engineering", desc: "Craft prompts for better AI outputs" },
      { title: "AI Content Creation", desc: "Write and edit AI-assisted content" },
      { title: "Generative AI", desc: "Build with generative AI tools" },
      { title: "AI Writing", desc: "Write with and about AI" },
      { title: "Automation", desc: "Workflows that cut manual work" },
      { title: "Chatbot", desc: "Deploy conversational bots" },
      { title: "ChatGPT", desc: "Projects using ChatGPT and OpenAI" },
    ],
  },
  {
    name: "Development & IT",
    sub: [
      { title: "Website Development", desc: "Sites from scratch or templates" },
      { title: "Coding", desc: "Coding across languages and stacks" },
      { title: "Software Development", desc: "Build software products and tools" },
      { title: "Python", desc: "Scripting, automation, Python" },
      { title: "Frontend Development", desc: "Build interfaces users love" },
      { title: "Web Design", desc: "Design clean, functional websites" },
      { title: "React JS", desc: "Build dynamic UIs with React" },
      { title: "WordPress", desc: "Build and maintain WordPress sites" },
      { title: "Full Stack Development", desc: "Full front and back end development" },
      { title: "Shopify", desc: "Build and customize Shopify stores" },
    ],
  },
  {
    name: "Marketing",
    sub: [
      { title: "Pay Per Click", desc: "Manage paid search and display ads" },
      { title: "Social Media Marketing", desc: "Grow audiences on social platforms" },
      { title: "Digital Marketing", desc: "Full-funnel marketing, all channels" },
      { title: "Social Media Management", desc: "Manage accounts, content, community" },
      { title: "Affiliate Marketing", desc: "Build and manage affiliate programs" },
      { title: "SEO", desc: "Improve rankings, organic traffic" },
      { title: "Email Marketing", desc: "Campaigns written to convert" },
      { title: "Lead Generation", desc: "Find and qualify sales prospects" },
      { title: "Google Ads", desc: "Run and optimize Google ads" },
      { title: "Influencer Marketing", desc: "Connect brands with top creators" },
    ],
  },
  {
    name: "Design & Creative",
    sub: [
      { title: "Graphic Design", desc: "Visual assets for brands/campaigns" },
      { title: "Logo Design", desc: "Marks and wordmarks for brands" },
      { title: "Illustration", desc: "Custom artwork for any use case" },
      { title: "Photo Editing", desc: "Retouch, composite, color-correct" },
      { title: "Canva", desc: "Social graphics and decks in Canva" },
      { title: "UX/UI Design", desc: "Intuitive digital experiences" },
      { title: "Presentation Design", desc: "Decks that communicate clearly" },
      { title: "3D Modeling", desc: "Create 3D assets and renders" },
      { title: "CAD Design", desc: "Technical drawings and CAD models" },
      { title: "Interior Design", desc: "Space planning, interior concepts" },
    ],
  },
  {
    name: "Video & Audio",
    sub: [
      { title: "Video Editing", desc: "Cut and polish video, any platform" },
      { title: "Voice Over", desc: "Pro voice recording, any project" },
      { title: "Voice Acting", desc: "Bring characters and scripts alive" },
      { title: "Animation", desc: "Characters, logos, explainers" },
      { title: "Narration", desc: "Clear, engaging spoken content" },
      { title: "Subtitling", desc: "Add captions and subtitles to video" },
      { title: "Videography", desc: "Shoot and produce pro video" },
      { title: "Motion Graphics", desc: "Animated graphics for video/social" },
      { title: "Audio Production", desc: "Record, mix, and master audio" },
      { title: "Podcasting", desc: "Produce and edit podcast content" },
    ],
  },
  {
    name: "Writing & Content",
    sub: [
      { title: "Writing", desc: "Writing across topics and formats" },
      { title: "Copywriting", desc: "Persuasive copy for ads and web" },
      { title: "Ghostwriting", desc: "Write content under another's name" },
      { title: "Proofreading", desc: "Catch errors before going live" },
      { title: "Content Writing", desc: "Blog posts, articles, web content" },
      { title: "Technical Writing", desc: "Docs and guides for complex topics" },
      { title: "Scriptwriting", desc: "Scripts for video, film, and audio" },
      { title: "Article Writing", desc: "Research-backed articles, any topic" },
      { title: "Creative Writing", desc: "Fiction, stories, creative work" },
      { title: "Resume Writing", desc: "Help job seekers land interviews" },
    ],
  },
  {
    name: "Admin & Support",
    sub: [
      { title: "Data Entry", desc: "Fast, accurate data processing work" },
      { title: "Virtual Assistant", desc: "Remote support for professionals" },
      { title: "Chat Support", desc: "Real-time customer chat support" },
      { title: "Data Annotation", desc: "Label data that trains AI models" },
      { title: "Transcription", desc: "Convert audio and video to text" },
      { title: "Microsoft Excel", desc: "Spreadsheets, formulas, cleanup" },
      { title: "Customer Service", desc: "Support customers across channels" },
      { title: "Appointment Setting", desc: "Book meetings for sales and service" },
      { title: "Executive Assistant", desc: "High-level support for executives" },
      { title: "Email Support", desc: "Handle customer inquiries by email" },
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
              color: activeIdx === idx ? "#14a800" : "#374151",
              fontWeight: activeIdx === idx ? 600 : 400,
              borderRight: activeIdx === idx ? "2px solid #14a800" : "2px solid transparent",
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
              <div className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors leading-snug">
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
                className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
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
  const borderCol = dark ? "rgba(17,24,39,0.12)" : "rgba(255,255,255,0.25)";

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
        <Link href="/" className="flex items-end flex-shrink-0 select-none" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: textCol, letterSpacing: "-0.03em", lineHeight: 1 }}>
            aimarket
          </span>
          <span style={{ color: "#14a800", fontSize: "1.6rem", fontWeight: 900, lineHeight: 1, marginBottom: -1 }}>.</span>
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
              Find Talent
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
                  footerLinks={[{ label: "See all skills", href: "/browse" }]}
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
              Find Work
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
                    { label: "See all jobs", href: "/jobs" },
                    { label: "Win work with ads", href: "/ads" },
                    { label: "Ways to earn", href: "/earn" },
                  ]}
                />
              </div>
            )}
          </div>

          {["Why AI Market"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3.5 py-2 rounded-md text-sm font-medium"
              style={{ color: textCol }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions - desktop */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all"
            style={{
              border: `1px solid ${borderCol}`,
              background: dark ? "white" : "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              color: dark ? "#6b7280" : "rgba(255,255,255,0.7)",
            }}
          >
            <Search size={13} />
            <span style={{ fontSize: "0.78rem" }}>Search</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-2 rounded-md transition-colors"
            style={{ color: textCol }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all"
            style={{
              background: "#14a800",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(20,168,0,0.35)",
            }}
          >
            Sign up
          </Link>
        </div>

        {/* Mobile: right side */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <Link href="/register" className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: "#14a800", color: "#fff" }}>
            Sign up
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
          {["Find Talent", "Find Work", "Why AI Market"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm font-medium text-gray-800 border-b border-gray-100"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 mt-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700">
              Log in
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
