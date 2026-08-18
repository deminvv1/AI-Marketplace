"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

/**
 * `name` is the value sent to /search — it must match the English taxonomy in
 * the database. `key` points at the translated label shown on screen.
 */
interface CategorySection {
  key: string;
  name: string;
  slug: string;
  skills: string[];
}

/**
 * Maps a project type's English name (which doubles as the /search query)
 * to its translation key. Anything missing is a technology or brand name
 * and stays untranslated on purpose.
 */
const TASK_KEYS: Record<string, string> = {
  "Build AI-powered applications": "buildAiPoweredApplications",
  "Train custom ML models": "trainCustomMlModels",
  "Develop chatbots & virtual assistants": "developChatbotsVirtualAssistants",
  "Fine-tune large language models": "fineTuneLargeLanguageModels",
  "Design automation workflows": "designAutomationWorkflows",
  "Craft prompt engineering systems": "craftPromptEngineeringSystems",
  "Develop computer vision systems": "developComputerVisionSystems",
  "Build AI agents & copilots": "buildAiAgentsCopilots",
  "AI code review & auditing": "aiCodeReviewAuditing",
  "Create generative AI products": "createGenerativeAiProducts",
  "Build agentic AI workflows": "buildAgenticAiWorkflows",
  "AI consulting & strategy": "aiConsultingStrategy",
  "AI data labeling & annotation": "aiDataLabelingAnnotation",
  "Reinforcement learning projects": "reinforcementLearningProjects",
  "Build full-stack web applications": "buildFullStackWebApplications",
  "Python backend development": "pythonBackendDevelopment",
  "Microservices architecture": "microservicesArchitecture",
  "Cybersecurity & penetration testing": "cybersecurityPenetrationTesting",
  "Blockchain & smart contracts": "blockchainSmartContracts",
  "Database design & optimization": "databaseDesignOptimization",
  "Code review & refactoring": "codeReviewRefactoring",
  "Legacy system modernization": "legacySystemModernization",
  "Performance optimization": "performanceOptimization",
  "Open-source contribution projects": "openSourceContributionProjects",
  "Build predictive ML models": "buildPredictiveMlModels",
  "Data pipeline engineering": "dataPipelineEngineering",
  "Business intelligence dashboards": "businessIntelligenceDashboards",
  "Statistical analysis & modeling": "statisticalAnalysisModeling",
  "Time series forecasting": "timeSeriesForecasting",
  "Natural language processing projects": "naturalLanguageProcessingProjects",
  "Computer vision model training": "computerVisionModelTraining",
  "Feature engineering & selection": "featureEngineeringSelection",
  "Data warehouse design": "dataWarehouseDesign",
  "Customer segmentation analysis": "customerSegmentationAnalysis",
  "Churn prediction models": "churnPredictionModels",
  "Recommendation system development": "recommendationSystemDevelopment",
  "AI model evaluation & benchmarking": "aiModelEvaluationBenchmarking",
  "UI/UX design for AI products": "uiUxDesignForAiProducts",
  "Brand identity & logo design": "brandIdentityLogoDesign",
  "Motion graphics & animation": "motionGraphicsAnimation",
  "AI-assisted illustration": "aiAssistedIllustration",
  "3D modeling & rendering": "3dModelingRendering",
  "Product design & prototyping": "productDesignPrototyping",
  "Presentation & pitch deck design": "presentationPitchDeckDesign",
  "Social media visual design": "socialMediaVisualDesign",
  "Web design & landing pages": "webDesignLandingPages",
  "AI art direction": "aiArtDirection",
  "Style transfer projects": "styleTransferProjects",
  "AR/VR interface design": "arVrInterfaceDesign",
  "Design system creation": "designSystemCreation",
  "Video thumbnail & cover design": "videoThumbnailCoverDesign",
  "Packaging & print design": "packagingPrintDesign",
  "Icon & asset creation": "iconAssetCreation",
  "UX research & usability testing": "uxResearchUsabilityTesting",
  "AI-assisted long-form content": "aiAssistedLongFormContent",
  "Technical documentation": "technicalDocumentation",
  "Copywriting & ad copy": "copywritingAdCopy",
  "Email sequence writing": "emailSequenceWriting",
  "Ghostwriting books & reports": "ghostwritingBooksReports",
  "Script writing for AI videos": "scriptWritingForAiVideos",
  "Multilingual translation & localization": "multilingualTranslationLocalization",
  "Legal & compliance document writing": "legalComplianceDocumentWriting",
  "Grant & proposal writing": "grantProposalWriting",
  "Product description copy": "productDescriptionCopy",
  "UX writing & microcopy": "uxWritingMicrocopy",
  "Case study & white paper writing": "caseStudyWhitePaperWriting",
  "Newsletter writing": "newsletterWriting",
  "Podcast show notes & scripts": "podcastShowNotesScripts",
  "Press releases & PR writing": "pressReleasesPrWriting",
  "AI prompt authoring": "aiPromptAuthoring",
  "Video script & voiceover copy": "videoScriptVoiceoverCopy",
  "Proofreading & editing": "proofreadingEditing",
  "Google & Meta Ads management": "googleMetaAdsManagement",
  "Email marketing automation": "emailMarketingAutomation",
  "Social media strategy & management": "socialMediaStrategyManagement",
  "Growth hacking & funnel optimization": "growthHackingFunnelOptimization",
  "Conversion rate optimization (CRO)": "conversionRateOptimizationCro",
  "Affiliate program setup & management": "affiliateProgramSetupManagement",
  "AI-powered ad creative": "aiPoweredAdCreative",
  "Marketing analytics & reporting": "marketingAnalyticsReporting",
  "Brand positioning & strategy": "brandPositioningStrategy",
  "Influencer & creator partnerships": "influencerCreatorPartnerships",
  "Community building & management": "communityBuildingManagement",
  "Lead generation campaigns": "leadGenerationCampaigns",
  "Product launch strategy": "productLaunchStrategy",
  "Content marketing strategy": "contentMarketingStrategy",
  "PR & media outreach": "prMediaOutreach",
  "Performance marketing": "performanceMarketing",
  "Referral & loyalty programs": "referralLoyaltyPrograms",
  "AI video editing & post-production": "aiVideoEditingPostProduction",
  "Voiceover & narration recording": "voiceoverNarrationRecording",
  "AI music composition": "aiMusicComposition",
  "Podcast editing & production": "podcastEditingProduction",
  "Motion graphics & kinetic typography": "motionGraphicsKineticTypography",
  "Sound design & audio engineering": "soundDesignAudioEngineering",
  "Subtitling & closed captioning": "subtitlingClosedCaptioning",
  "Video scriptwriting": "videoScriptwriting",
  "Product & explainer video production": "productExplainerVideoProduction",
  "AI dubbing & localization": "aiDubbingLocalization",
  "Corporate video production": "corporateVideoProduction",
  "Documentary editing": "documentaryEditing",
  "Live stream setup & management": "liveStreamSetupManagement",
  "VFX & visual effects": "vfxVisualEffects",
  "Intro / outro animation creation": "introOutroAnimationCreation",
  "Audio branding & jingles": "audioBrandingJingles",
  "Healthcare AI & medical imaging": "healthcareAiMedicalImaging",
  "FinTech AI & algorithmic trading": "fintechAiAlgorithmicTrading",
  "Legal AI & contract analysis": "legalAiContractAnalysis",
  "Retail AI & recommendation engines": "retailAiRecommendationEngines",
  "EdTech AI & adaptive learning systems": "edtechAiAdaptiveLearningSystems",
  "Agriculture & precision farming AI": "agriculturePrecisionFarmingAi",
  "Manufacturing & predictive maintenance AI": "manufacturingPredictiveMaintenanceAi",
  "Real estate PropTech AI": "realEstateProptechAi",
  "Energy & smart grid optimization AI": "energySmartGridOptimizationAi",
  "Logistics & route optimization AI": "logisticsRouteOptimizationAi",
  "HR & recruitment AI systems": "hrRecruitmentAiSystems",
  "Insurance & actuarial AI": "insuranceActuarialAi",
  "Pharmaceutical drug discovery AI": "pharmaceuticalDrugDiscoveryAi",
  "Cybersecurity threat detection AI": "cybersecurityThreatDetectionAi",
  "Autonomous systems & robotics": "autonomousSystemsRobotics",
  "Smart city & IoT AI": "smartCityIotAi",
  "Environmental monitoring AI": "environmentalMonitoringAi",
  "Media & entertainment AI": "mediaEntertainmentAi",
  "Sports analytics AI": "sportsAnalyticsAi",
  "Government & public sector AI": "governmentPublicSectorAi",
  "AI business analysis & requirements": "aiBusinessAnalysisRequirements",
  "AI product management": "aiProductManagement",
  "AI project management & delivery": "aiProjectManagementDelivery",
  "Digital transformation consulting": "digitalTransformationConsulting",
  "Enterprise AI architecture": "enterpriseAiArchitecture",
  "AI ethics & governance consulting": "aiEthicsGovernanceConsulting",
  "AI workflow design & optimization": "aiWorkflowDesignOptimization",
  "Change management for AI adoption": "changeManagementForAiAdoption",
  "AI vendor evaluation & procurement": "aiVendorEvaluationProcurement",
  "Technology roadmap planning": "technologyRoadmapPlanning",
  "AI ROI analysis & business cases": "aiRoiAnalysisBusinessCases",
  "Process mining & improvement": "processMiningImprovement",
  "AI training & team upskilling": "aiTrainingTeamUpskilling",
  "Innovation strategy consulting": "innovationStrategyConsulting",
  "AI startup advising & mentoring": "aiStartupAdvisingMentoring",
  "Board-level AI advisory": "boardLevelAiAdvisory",
  "AI policy & regulation consulting": "aiPolicyRegulationConsulting",
  "OKR & KPI design for AI teams": "okrKpiDesignForAiTeams",
  "AI-powered virtual assistance": "aiPoweredVirtualAssistance",
};

const CATEGORIES: CategorySection[] = [
  {
    name: "AI & Automation",
    key: "c1",
    slug: "ai-automation",
    skills: [
      "Build AI-powered applications", "Train custom ML models", "Develop chatbots & virtual assistants", "Integrate OpenAI / Claude APIs",
      "Fine-tune large language models", "Design automation workflows", "Build n8n / Make / Zapier pipelines", "Craft prompt engineering systems",
      "Develop computer vision systems", "Create NLP pipelines", "Build AI agents & copilots", "Implement RAG architectures",
      "AI code review & auditing", "Create generative AI products", "Build agentic AI workflows", "AI consulting & strategy",
      "Stable Diffusion / Midjourney projects", "Voice AI & ElevenLabs integration", "AI data labeling & annotation", "Reinforcement learning projects",
    ],
  },
  {
    name: "Programming & Development",
    key: "c2",
    slug: "programming",
    skills: [
      "Build full-stack web applications", "Develop REST & GraphQL APIs", "Python backend development", "React / Next.js frontend projects",
      "Node.js & Express development", "FastAPI & Django projects", "Mobile app development (iOS/Android)", "Cloud infrastructure (AWS/GCP/Azure)",
      "Docker & Kubernetes DevOps", "Microservices architecture", "Cybersecurity & penetration testing", "Blockchain & smart contracts",
      "WordPress & Shopify customization", "Database design & optimization", "WebSocket & real-time systems", "CI/CD pipeline setup",
      "Code review & refactoring", "Legacy system modernization", "Performance optimization", "Open-source contribution projects",
    ],
  },
  {
    name: "Data Science & Analytics",
    key: "c3",
    slug: "data-science",
    skills: [
      "Exploratory data analysis (EDA)", "Build predictive ML models", "Data pipeline engineering", "Business intelligence dashboards",
      "Statistical analysis & modeling", "Time series forecasting", "A/B testing & experimentation", "Natural language processing projects",
      "Computer vision model training", "MLOps & model deployment", "Feature engineering & selection", "TensorFlow / PyTorch model building",
      "Pandas / NumPy data wrangling", "Power BI / Tableau dashboards", "Data warehouse design", "Kaggle-style competitions",
      "Customer segmentation analysis", "Churn prediction models", "Recommendation system development", "AI model evaluation & benchmarking",
    ],
  },
  {
    name: "Design & Creative AI",
    key: "c4",
    slug: "design",
    skills: [
      "UI/UX design for AI products", "AI image generation (Midjourney, DALL-E)", "Brand identity & logo design", "Motion graphics & animation",
      "AI-assisted illustration", "3D modeling & rendering", "Product design & prototyping", "Figma design systems",
      "Presentation & pitch deck design", "Social media visual design", "Web design & landing pages", "AI art direction",
      "Stable Diffusion custom workflows", "Style transfer projects", "AR/VR interface design", "Design system creation",
      "Video thumbnail & cover design", "Packaging & print design", "Icon & asset creation", "UX research & usability testing",
    ],
  },
  {
    name: "Content & Writing AI",
    key: "c5",
    slug: "content",
    skills: [
      "AI-assisted long-form content", "SEO article & blog writing", "Technical documentation", "Copywriting & ad copy",
      "Email sequence writing", "LinkedIn & social media content", "Ghostwriting books & reports", "Script writing for AI videos",
      "Multilingual translation & localization", "Legal & compliance document writing", "Grant & proposal writing", "Product description copy",
      "UX writing & microcopy", "Case study & white paper writing", "Newsletter writing", "Podcast show notes & scripts",
      "Press releases & PR writing", "AI prompt authoring", "Video script & voiceover copy", "Proofreading & editing",
    ],
  },
  {
    name: "Marketing & Growth AI",
    key: "c6",
    slug: "marketing",
    skills: [
      "SEO strategy & on-page optimization", "Google & Meta Ads management", "Email marketing automation", "Social media strategy & management",
      "Growth hacking & funnel optimization", "Conversion rate optimization (CRO)", "Affiliate program setup & management", "AI-powered ad creative",
      "Marketing analytics & reporting", "Brand positioning & strategy", "Influencer & creator partnerships", "YouTube & TikTok channel growth",
      "Community building & management", "Lead generation campaigns", "Product launch strategy", "Content marketing strategy",
      "Marketing automation (HubSpot, Klaviyo)", "PR & media outreach", "Performance marketing", "Referral & loyalty programs",
    ],
  },
  {
    name: "Video & Audio AI",
    key: "c7",
    slug: "video-audio",
    skills: [
      "AI video editing & post-production", "AI video generation (Sora, Runway ML)", "Voiceover & narration recording", "AI music composition",
      "Podcast editing & production", "Motion graphics & kinetic typography", "YouTube channel management", "Short-form content (Reels, TikTok)",
      "ElevenLabs voice cloning projects", "Sound design & audio engineering", "Subtitling & closed captioning", "Video scriptwriting",
      "Product & explainer video production", "AI dubbing & localization", "Corporate video production", "Documentary editing",
      "Live stream setup & management", "VFX & visual effects", "Intro / outro animation creation", "Audio branding & jingles",
    ],
  },
  {
    name: "Industry AI Solutions",
    key: "c8",
    slug: "industry",
    skills: [
      "Healthcare AI & medical imaging", "FinTech AI & algorithmic trading", "Legal AI & contract analysis", "Retail AI & recommendation engines",
      "EdTech AI & adaptive learning systems", "Agriculture & precision farming AI", "Manufacturing & predictive maintenance AI", "Real estate PropTech AI",
      "Energy & smart grid optimization AI", "Logistics & route optimization AI", "HR & recruitment AI systems", "Insurance & actuarial AI",
      "Pharmaceutical drug discovery AI", "Cybersecurity threat detection AI", "Autonomous systems & robotics", "Smart city & IoT AI",
      "Environmental monitoring AI", "Media & entertainment AI", "Sports analytics AI", "Government & public sector AI",
    ],
  },
  {
    name: "Business & Strategy AI",
    key: "c9",
    slug: "business",
    skills: [
      "AI business analysis & requirements", "AI product management", "AI project management & delivery", "Digital transformation consulting",
      "Enterprise AI architecture", "AI ethics & governance consulting", "CRM & sales automation", "AI workflow design & optimization",
      "Change management for AI adoption", "AI vendor evaluation & procurement", "Technology roadmap planning", "AI ROI analysis & business cases",
      "Process mining & improvement", "AI training & team upskilling", "Innovation strategy consulting", "AI startup advising & mentoring",
      "Board-level AI advisory", "AI policy & regulation consulting", "OKR & KPI design for AI teams", "AI-powered virtual assistance",
    ],
  },
];

export default function WorkPage() {
  const t = useTranslations("work");
  const tTask = useTranslations("tasks");
  const locale = useLocale();
  const isRtl = locale === "ar";

  /** Translated label for a project type, falling back to the English name. */
  const taskLabel = (task: string) => {
    const key = TASK_KEYS[task];
    return key ? tTask(key) : task;
  };

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

      {/* Category accordion */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {CATEGORIES.map((cat) => {
          const open = expanded[cat.slug];
          return (
            <div key={cat.slug} style={{ borderBottom: "1px solid #e5e7eb" }}>
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

              {open && (
                <div style={{ paddingBottom: 36 }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b7280", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {t("popularTypes")}:
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: "10px 24px", marginBottom: 32 }}>
                    {cat.skills.map((skill) => (
                      <Link
                        key={skill}
                        href={`/search?q=${encodeURIComponent(skill)}`}
                        style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none", lineHeight: 1.4 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                      >
                        {taskLabel(skill)}
                      </Link>
                    ))}
                  </div>

                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                    {t(cat.key.replace("c", "t"))}
                  </p>

                  <Link
                    href={`/search?category=${encodeURIComponent(cat.name)}`}
                    style={{
                      display: "inline-block",
                      padding: "9px 20px",
                      borderRadius: 30,
                      border: "1.5px solid #6366f1",
                      color: "#6366f1",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      textDecoration: "none",
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
