"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

/**
 * `name` is the value sent to /browse — it must match the English taxonomy in
 * the database. `key` points at the translated label shown on screen.
 * Skill strings are likewise both label and query, so they stay English for now.
 */
interface CategorySection {
  key: string;
  name: string;
  slug: string;
  skills: string[];
}

/**
 * Maps a skill's English name (which doubles as the /browse query) to its
 * translation key. Anything missing here is a technology or brand name and
 * is shown untranslated on purpose.
 */
const SKILL_KEYS: Record<string, string> = {
  "AI Developers": "aiDevelopers",
  "Machine Learning Engineers": "machineLearningEngineers",
  "Chatbot Developers": "chatbotDevelopers",
  "Computer Vision Engineers": "computerVisionEngineers",
  "Prompt Engineers": "promptEngineers",
  "AI Integration Developers": "aiIntegrationDevelopers",
  "Automation Experts": "automationExperts",
  "AI Consultants": "aiConsultants",
  "AI Voice Cloning Experts": "aiVoiceCloningExperts",
  "AI Data Labeling Specialists": "aiDataLabelingSpecialists",
  "Reinforcement Learning Engineers": "reinforcementLearningEngineers",
  "AI Workflow Architects": "aiWorkflowArchitects",
  "Generative AI Developers": "generativeAiDevelopers",
  "AI Product Managers": "aiProductManagers",
  "Agentic AI Developers": "agenticAiDevelopers",
  "Full-Stack Developers": "fullStackDevelopers",
  "Backend Developers": "backendDevelopers",
  "Cloud & DevOps Engineers": "cloudDevopsEngineers",
  "Mobile App Developers": "mobileAppDevelopers",
  "Cybersecurity Specialists": "cybersecuritySpecialists",
  "Microservices Architects": "microservicesArchitects",
  "Data Scientists": "dataScientists",
  "ML Engineers": "mlEngineers",
  "Data Analysts": "dataAnalysts",
  "Data Engineers": "dataEngineers",
  "Business Intelligence Analysts": "businessIntelligenceAnalysts",
  "Statistical Modelers": "statisticalModelers",
  "AI Researchers": "aiResearchers",
  "Forecasting & Time Series Experts": "forecastingTimeSeriesExperts",
  "Quantitative Analysts": "quantitativeAnalysts",
  "Data Pipeline Architects": "dataPipelineArchitects",
  "Feature Engineering Specialists": "featureEngineeringSpecialists",
  "Model Evaluation Experts": "modelEvaluationExperts",
  "UI/UX Designers": "uiUxDesigners",
  "AI Image Generation Artists": "aiImageGenerationArtists",
  "Logo & Brand Designers": "logoBrandDesigners",
  "Motion Designers": "motionDesigners",
  "AI Video Creators": "aiVideoCreators",
  "3D AI Artists": "3dAiArtists",
  "Product Designers": "productDesigners",
  "Presentation Designers": "presentationDesigners",
  "Graphic Designers": "graphicDesigners",
  "AI Art Directors": "aiArtDirectors",
  "Web Designers": "webDesigners",
  "Brand Identity Designers": "brandIdentityDesigners",
  "Social Media Designers": "socialMediaDesigners",
  "Packaging Designers": "packagingDesigners",
  "AR / VR Designers": "arVrDesigners",
  "AI Style Transfer Artists": "aiStyleTransferArtists",
  "Illustration Specialists": "illustrationSpecialists",
  "AI Content Creators": "aiContentCreators",
  "Copywriters": "copywriters",
  "Technical Writers": "technicalWriters",
  "AI-Assisted Translators": "aiAssistedTranslators",
  "Script Writers": "scriptWriters",
  "Blog & Article Writers": "blogArticleWriters",
  "Ghostwriters": "ghostwriters",
  "Email Copywriters": "emailCopywriters",
  "LinkedIn Content Creators": "linkedinContentCreators",
  "Grant Writers": "grantWriters",
  "Legal Document Writers": "legalDocumentWriters",
  "Product Description Writers": "productDescriptionWriters",
  "UX Writers": "uxWriters",
  "AI Prompt Writers": "aiPromptWriters",
  "Multilingual Content Specialists": "multilingualContentSpecialists",
  "Proofreaders & Editors": "proofreadersEditors",
  "Podcast Script Writers": "podcastScriptWriters",
  "White Paper Authors": "whitePaperAuthors",
  "Case Study Writers": "caseStudyWriters",
  "AI Marketing Strategists": "aiMarketingStrategists",
  "PPC & Google Ads Experts": "ppcGoogleAdsExperts",
  "Social Media AI Managers": "socialMediaAiManagers",
  "Email Marketing Automation Experts": "emailMarketingAutomationExperts",
  "Growth Hackers": "growthHackers",
  "CRO Specialists": "croSpecialists",
  "AI Ad Copywriters": "aiAdCopywriters",
  "Affiliate Marketing Experts": "affiliateMarketingExperts",
  "Influencer Marketing Managers": "influencerMarketingManagers",
  "Brand Strategists": "brandStrategists",
  "Lead Generation Specialists": "leadGenerationSpecialists",
  "TikTok & YouTube Strategists": "tiktokYoutubeStrategists",
  "Marketing Analytics Experts": "marketingAnalyticsExperts",
  "Content Marketing Managers": "contentMarketingManagers",
  "AI-Powered PR Specialists": "aiPoweredPrSpecialists",
  "Programmatic Advertising Experts": "programmaticAdvertisingExperts",
  "Conversion Funnel Specialists": "conversionFunnelSpecialists",
  "Community Managers": "communityManagers",
  "Performance Marketers": "performanceMarketers",
  "AI Video Editors": "aiVideoEditors",
  "AI Video Generators": "aiVideoGenerators",
  "Voice-over Artists": "voiceOverArtists",
  "AI Music Composers": "aiMusicComposers",
  "Podcast Producers": "podcastProducers",
  "Motion Graphics Artists": "motionGraphicsArtists",
  "Audio Engineers": "audioEngineers",
  "YouTube Channel Managers": "youtubeChannelManagers",
  "Subtitling & Captioning Experts": "subtitlingCaptioningExperts",
  "Video Scriptwriters": "videoScriptwriters",
  "Short-Form Content Creators": "shortFormContentCreators",
  "Documentary Editors": "documentaryEditors",
  "Sound Designers": "soundDesigners",
  "AI Dubbing Specialists": "aiDubbingSpecialists",
  "Explainer Video Creators": "explainerVideoCreators",
  "Product Demo Video Producers": "productDemoVideoProducers",
  "VFX Artists": "vfxArtists",
  "Live Streaming Experts": "liveStreamingExperts",
  "Healthcare AI Developers": "healthcareAiDevelopers",
  "FinTech AI Specialists": "fintechAiSpecialists",
  "Legal AI & LegalTech Experts": "legalAiLegaltechExperts",
  "Retail & E-Commerce AI Developers": "retailECommerceAiDevelopers",
  "EdTech AI Developers": "edtechAiDevelopers",
  "Agriculture & Precision Farming AI": "agriculturePrecisionFarmingAi",
  "Manufacturing & Industry 4.0 AI": "manufacturingIndustry40Ai",
  "Real Estate PropTech AI": "realEstateProptechAi",
  "Energy & Smart Grid AI Engineers": "energySmartGridAiEngineers",
  "Logistics & Supply Chain AI": "logisticsSupplyChainAi",
  "HR & Recruitment AI Specialists": "hrRecruitmentAiSpecialists",
  "Cybersecurity AI Experts": "cybersecurityAiExperts",
  "Insurance AI Actuaries": "insuranceAiActuaries",
  "Pharmaceutical AI Researchers": "pharmaceuticalAiResearchers",
  "Autonomous Vehicle AI Engineers": "autonomousVehicleAiEngineers",
  "Smart City AI Consultants": "smartCityAiConsultants",
  "Climate & Environmental AI Researchers": "climateEnvironmentalAiResearchers",
  "Media & Entertainment AI Developers": "mediaEntertainmentAiDevelopers",
  "Sports Analytics AI Specialists": "sportsAnalyticsAiSpecialists",
  "Government & Public Sector AI": "governmentPublicSectorAi",
  "AI Business Analysts": "aiBusinessAnalysts",
  "AI Project Managers": "aiProjectManagers",
  "Enterprise AI Architects": "enterpriseAiArchitects",
  "AI Ethics & Governance Consultants": "aiEthicsGovernanceConsultants",
  "AI Workflow Consultants": "aiWorkflowConsultants",
  "Digital Transformation Specialists": "digitalTransformationSpecialists",
  "Virtual AI Assistants": "virtualAiAssistants",
  "AI Procurement Specialists": "aiProcurementSpecialists",
  "Change Management Consultants": "changeManagementConsultants",
  "AI ROI Analysts": "aiRoiAnalysts",
  "Technology Roadmap Consultants": "technologyRoadmapConsultants",
  "AI Vendor Assessment Specialists": "aiVendorAssessmentSpecialists",
  "Process Mining Experts": "processMiningExperts",
  "AI Training & Coaching": "aiTrainingCoaching",
  "Board-level AI Advisors": "boardLevelAiAdvisors",
  "AI Policy Consultants": "aiPolicyConsultants",
  "Innovation Managers": "innovationManagers",
  "AI Startup Mentors": "aiStartupMentors",
};

const CATEGORIES: CategorySection[] = [
  {
    name: "AI & Automation",
    key: "c1",
    slug: "ai-automation",
    skills: [
      "AI Developers", "Machine Learning Engineers", "Chatbot Developers", "Computer Vision Engineers",
      "NLP Engineers", "Prompt Engineers", "AI Integration Developers", "Automation Experts",
      "OpenAI API Developers", "LLM Fine-tuning Specialists", "n8n / Make / Zapier Experts", "AI Consultants",
      "Stable Diffusion Artists", "AI Voice Cloning Experts", "AI Data Labeling Specialists", "Reinforcement Learning Engineers",
      "AI Workflow Architects", "Generative AI Developers", "AI Product Managers", "Agentic AI Developers",
    ],
  },
  {
    name: "Programming & Development",
    key: "c2",
    slug: "programming",
    skills: [
      "Full-Stack Developers", "Backend Developers", "Python Developers", "React / Next.js Developers",
      "Node.js Developers", "API Developers", "Cloud & DevOps Engineers", "Mobile App Developers",
      "FastAPI Developers", "Django Developers", "Docker & Kubernetes Experts", "AWS / GCP / Azure Engineers",
      "Blockchain & Web3 Developers", "Cybersecurity Specialists", "WordPress Developers", "Shopify Developers",
      "TypeScript Developers", "GraphQL Developers", "WebSocket Engineers", "Microservices Architects",
    ],
  },
  {
    name: "Data Science & Analytics",
    key: "c3",
    slug: "data-science",
    skills: [
      "Data Scientists", "ML Engineers", "Data Analysts", "Data Engineers",
      "Business Intelligence Analysts", "MLOps Engineers", "Statistical Modelers", "AI Researchers",
      "Pandas / NumPy Experts", "TensorFlow / PyTorch Developers", "Apache Spark Engineers", "SQL / NoSQL Specialists",
      "Power BI / Tableau Analysts", "A/B Testing Specialists", "Forecasting & Time Series Experts", "Kaggle Competition Winners",
      "Quantitative Analysts", "Data Pipeline Architects", "Feature Engineering Specialists", "Model Evaluation Experts",
    ],
  },
  {
    name: "Design & Creative AI",
    key: "c4",
    slug: "design",
    skills: [
      "UI/UX Designers", "AI Image Generation Artists", "Logo & Brand Designers", "Motion Designers",
      "Midjourney Prompt Artists", "DALL-E / Firefly Artists", "AI Video Creators", "3D AI Artists",
      "Product Designers", "Presentation Designers", "Graphic Designers", "AI Art Directors",
      "Web Designers", "Figma Designers", "Brand Identity Designers", "Social Media Designers",
      "Packaging Designers", "AR / VR Designers", "AI Style Transfer Artists", "Illustration Specialists",
    ],
  },
  {
    name: "Content & Writing AI",
    key: "c5",
    slug: "content",
    skills: [
      "AI Content Creators", "Copywriters", "Technical Writers", "SEO Content Strategists",
      "AI-Assisted Translators", "Script Writers", "Blog & Article Writers", "Ghostwriters",
      "Email Copywriters", "LinkedIn Content Creators", "Grant Writers", "Legal Document Writers",
      "Product Description Writers", "UX Writers", "AI Prompt Writers", "Multilingual Content Specialists",
      "Proofreaders & Editors", "Podcast Script Writers", "White Paper Authors", "Case Study Writers",
    ],
  },
  {
    name: "Marketing & Growth AI",
    key: "c6",
    slug: "marketing",
    skills: [
      "AI Marketing Strategists", "SEO Specialists", "PPC & Google Ads Experts", "Social Media AI Managers",
      "Email Marketing Automation Experts", "Growth Hackers", "CRO Specialists", "AI Ad Copywriters",
      "Affiliate Marketing Experts", "Influencer Marketing Managers", "Brand Strategists", "Lead Generation Specialists",
      "TikTok & YouTube Strategists", "Marketing Analytics Experts", "Content Marketing Managers", "AI-Powered PR Specialists",
      "Programmatic Advertising Experts", "Conversion Funnel Specialists", "Community Managers", "Performance Marketers",
    ],
  },
  {
    name: "Video & Audio AI",
    key: "c7",
    slug: "video-audio",
    skills: [
      "AI Video Editors", "AI Video Generators", "Voice-over Artists", "AI Music Composers",
      "Podcast Producers", "Motion Graphics Artists", "Audio Engineers", "YouTube Channel Managers",
      "Sora / Runway ML Experts", "ElevenLabs Voice Specialists", "Subtitling & Captioning Experts", "Video Scriptwriters",
      "Short-Form Content Creators", "Documentary Editors", "Sound Designers", "AI Dubbing Specialists",
      "Explainer Video Creators", "Product Demo Video Producers", "VFX Artists", "Live Streaming Experts",
    ],
  },
  {
    name: "Industry AI Solutions",
    key: "c8",
    slug: "industry",
    skills: [
      "Healthcare AI Developers", "FinTech AI Specialists", "Legal AI & LegalTech Experts", "Retail & E-Commerce AI Developers",
      "EdTech AI Developers", "Agriculture & Precision Farming AI", "Manufacturing & Industry 4.0 AI", "Real Estate PropTech AI",
      "Energy & Smart Grid AI Engineers", "Logistics & Supply Chain AI", "HR & Recruitment AI Specialists", "Cybersecurity AI Experts",
      "Insurance AI Actuaries", "Pharmaceutical AI Researchers", "Autonomous Vehicle AI Engineers", "Smart City AI Consultants",
      "Climate & Environmental AI Researchers", "Media & Entertainment AI Developers", "Sports Analytics AI Specialists", "Government & Public Sector AI",
    ],
  },
  {
    name: "Business & Strategy AI",
    key: "c9",
    slug: "business",
    skills: [
      "AI Business Analysts", "AI Project Managers", "AI Product Managers", "Enterprise AI Architects",
      "AI Ethics & Governance Consultants", "CRM Automation Experts", "AI Workflow Consultants", "Digital Transformation Specialists",
      "Virtual AI Assistants", "AI Procurement Specialists", "Change Management Consultants", "AI ROI Analysts",
      "Technology Roadmap Consultants", "AI Vendor Assessment Specialists", "Process Mining Experts", "AI Training & Coaching",
      "Board-level AI Advisors", "AI Policy Consultants", "Innovation Managers", "AI Startup Mentors",
    ],
  },
];

export default function HirePage() {
  const t = useTranslations("hire");
  const tSkill = useTranslations("skills");

  /** Translated label for a skill, falling back to the English name. */
  const skillLabel = (skill: string) => {
    const key = SKILL_KEYS[skill];
    return key ? tSkill(key) : skill;
  };
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c, i) => [c.slug, i === 0]))
  );

  const toggle = (slug: string) =>
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Hero */}
      <div style={{ paddingTop: 80, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 40px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: 12 }}>
            {t("heroTitle")}
          </h1>
          <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: 560 }}>
            {t("heroDesc")}
          </p>
        </div>
      </div>

      {/* Category sections */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {CATEGORIES.map((cat) => {
          const open = expanded[cat.slug];
          return (
            <div key={cat.slug} style={{ borderBottom: "1px solid #e5e7eb" }}>
              {/* Category header */}
              <button
                onClick={() => toggle(cat.slug)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "28px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: open ? "#ede9fe" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <ChevronDown
                      size={16}
                      style={{
                        color: open ? "#6366f1" : "#9ca3af",
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "clamp(1.1rem,2vw,1.3rem)", fontWeight: 700, color: "#111827" }}>
                    {t(cat.key)}
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              {open && (
                <div style={{ paddingBottom: 36 }}>
                  {/* Popular skills label */}
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b7280", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {t("popularSkills")}:
                  </p>

                  {/* Skills grid — 4 columns */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))", gap: "10px 24px", marginBottom: 32 }}>
                    {cat.skills.map((skill) => (
                      <Link
                        key={skill}
                        href={`/browse?q=${encodeURIComponent(skill)}`}
                        style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none", lineHeight: 1.4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                      >
                        {skillLabel(skill)}
                      </Link>
                    ))}
                  </div>

                  {/* Tagline + CTA */}
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    {t(cat.key.replace("c", "t"))}
                  </p>
                  <Link
                    href={`/browse?category=${encodeURIComponent(cat.name)}`}
                    style={{
                      display: "inline-block",
                      padding: "9px 20px",
                      borderRadius: 30,
                      border: "1.5px solid #6366f1",
                      color: "#6366f1",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#6366f1";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6366f1";
                    }}
                  >
                    {t("explore", { category: t(cat.key) })} →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
