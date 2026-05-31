export const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic",
  "Denmark","Egypt","Estonia","Finland","France","Germany","Greece","Hungary","Iceland","India",
  "Indonesia","Ireland","Israel","Italy","Japan","Kazakhstan","Kenya","Latvia","Lithuania","Luxembourg",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines",
  "Poland","Portugal","Qatar","Romania","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa",
  "South Korea","Spain","Sweden","Switzerland","Thailand","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Vietnam"
];

export const FLAGS: Record<string,string> = {
  "United States":"🇺🇸","United Kingdom":"🇬🇧","Germany":"🇩🇪","France":"🇫🇷","Japan":"🇯🇵",
  "Spain":"🇪🇸","Italy":"🇮🇹","Canada":"🇨🇦","Brazil":"🇧🇷","Australia":"🇦🇺",
  "Netherlands":"🇳🇱","Sweden":"🇸🇪","Switzerland":"🇨🇭","Singapore":"🇸🇬","India":"🇮🇳",
  "South Korea":"🇰🇷","Ukraine":"🇺🇦","Poland":"🇵🇱","Israel":"🇮🇱","Mexico":"🇲🇽",
};
export const flag = (c: string) => FLAGS[c] ?? "🌐";

export const PROJECTS = [
  { id: 1, title: "Medical imaging classifier for radiology clinic", desc: "Need a CNN model trained on chest X-rays to detect early pneumonia signs with 95%+ accuracy. HIPAA compliance required.", industry: "Medicine", budget: "$3,500 – $7,000", deadline: "Aug 24, 2026", country: "Germany", date: "2h ago", status: "open" },
  { id: 2, title: "Generative AI artwork series for NFT drop", desc: "Looking for a Stable Diffusion specialist to create 1,000 unique stylized portraits in a custom aesthetic.", industry: "Art", budget: "$1,200 – $2,500", deadline: "Jul 10, 2026", country: "Japan", date: "5h ago", status: "in_progress" },
  { id: 3, title: "Algorithmic trading signal model (crypto)", desc: "Build a transformer-based model that predicts BTC/ETH short-term price movements from on-chain + sentiment data.", industry: "Finance", budget: "$5,000 – $12,000", deadline: "Sep 1, 2026", country: "Singapore", date: "1d ago", status: "open" },
  { id: 4, title: "AI tutor chatbot for high school chemistry", desc: "RAG pipeline over textbooks with conversational tutor persona. Multilingual support (EN/ES/PT).", industry: "Education", budget: "$2,000 – $4,500", deadline: "Aug 15, 2026", country: "Brazil", date: "1d ago", status: "open" },
  { id: 5, title: "Marketing copy generator with brand voice", desc: "Fine-tune an LLM on our brand voice guidelines to produce on-brand ad copy across 6 product lines.", industry: "Marketing", budget: "$1,800 – $3,000", deadline: "Jul 28, 2026", country: "United States", date: "2d ago", status: "open" },
  { id: 6, title: "Contract clause extraction & redlining tool", desc: "NLP model to extract key clauses from M&A contracts and flag deviations from a standard template.", industry: "Legal", budget: "$4,000 – $9,000", deadline: "Aug 30, 2026", country: "United Kingdom", date: "3d ago", status: "closed" },
];

export const FREELANCERS = [
  { name: "Yuki Tanaka", handle: "@yuki.ai", country: "Japan", rating: 4.9, reviews: 87, specialty: "Computer Vision", online: true },
  { name: "Anya Volkov", handle: "@anya.nlp", country: "Ukraine", rating: 4.8, reviews: 124, specialty: "NLP / LLM tuning", online: true },
  { name: "Marcus Chen", handle: "@marcus.ml", country: "Singapore", rating: 5.0, reviews: 56, specialty: "MLOps & Inference", online: false },
  { name: "Sofia Reyes", handle: "@sofia.gen", country: "Mexico", rating: 4.7, reviews: 73, specialty: "Generative AI", online: true },
  { name: "Jonas Weber", handle: "@jonas.rl", country: "Germany", rating: 4.9, reviews: 142, specialty: "Reinforcement Learning", online: false },
  { name: "Priya Sharma", handle: "@priya.data", country: "India", rating: 4.6, reviews: 98, specialty: "Data Engineering", online: true },
];

export const SOLUTIONS = [
  { title: "MediScan Pro — radiology triage SaaS", industry: "Medicine", format: "SaaS", price: "$499 / mo", author: "Yuki Tanaka", rating: 4.9 },
  { title: "BrandVoice LLM fine-tuning API", industry: "Marketing", format: "API", price: "$299", author: "Sofia Reyes", rating: 4.7 },
  { title: "Legal Clause Extractor v2", industry: "Legal", format: "Script", price: "$149", author: "Anya Volkov", rating: 4.8 },
  { title: "ChartMind — financial chart Q&A", industry: "Finance", format: "SaaS", price: "$89 / mo", author: "Marcus Chen", rating: 5.0 },
  { title: "EduTutor RAG starter kit", industry: "Education", format: "Script", price: "$199", author: "Priya Sharma", rating: 4.6 },
  { title: "AI strategy consultation (90 min)", industry: "Consulting", format: "Consultation", price: "Price on request", author: "Jonas Weber", rating: 4.9 },
];

export const FORUM_CATEGORIES = [
  { name: "General Discussion", count: 342, icon: "💬" },
  { name: "AI in Medicine", count: 128, icon: "🩺" },
  { name: "AI in Art", count: 95, icon: "🎨" },
  { name: "AI in Finance", count: 87, icon: "📈" },
  { name: "AI in Education", count: 64, icon: "🎓" },
  { name: "AI in Legal", count: 41, icon: "⚖️" },
];

export const THREADS = [
  { id: 1, author: "Anya Volkov", title: "Best open-source LLM for medical Q&A in 2026?", cat: "AI in Medicine", industry: "Medicine", preview: "We've tested Llama 3.3, Mistral, and a fine-tuned Phi-4. The results on MedQA are surprising — Phi-4 actually outperforms…", likes: 248, comments: 47, country: "Ukraine", time: "2h ago", translated: true },
  { id: 2, author: "Marcus Chen", title: "RAG vs long-context: a real benchmark on 100k-token contracts", cat: "AI in Legal", industry: "Legal", preview: "Spent 3 weeks comparing pure long-context Gemini against a hybrid RAG approach for legal contract analysis…", likes: 189, comments: 32, country: "Singapore", time: "6h ago", translated: false },
  { id: 3, author: "Sofia Reyes", title: "Stable Diffusion 4 — first impressions from the Mexico AI Art collective", cat: "AI in Art", industry: "Art", preview: "We got early access. The control over composition and the new style transfer features are genuinely a leap forward…", likes: 412, comments: 91, country: "Mexico", time: "1d ago", translated: true },
  { id: 4, author: "Jonas Weber", title: "Why I'm bullish on small specialized models", cat: "General Discussion", industry: "General", preview: "After 18 months running production RL agents I'm convinced the next wave isn't bigger models, it's…", likes: 156, comments: 28, country: "Germany", time: "1d ago", translated: false },
];

export const CONVERSATIONS = [
  { name: "Anya Volkov", last: "Sent over the v2 weights — let me know if the eval improved", time: "12:42", unread: 2, online: true },
  { name: "Yuki Tanaka", last: "I can start the radiology project on Monday", time: "11:08", unread: 0, online: true },
  { name: "Marcus Chen", last: "Voice message", time: "Yesterday", unread: 1, online: false },
  { name: "Sofia Reyes", last: "¡Gracias! Auto-translated: Thanks for the brief — looks great.", time: "Yesterday", unread: 0, online: true },
  { name: "Jonas Weber", last: "The RL paper you sent is exactly what I needed.", time: "Mon", unread: 0, online: false },
  { name: "Priya Sharma", last: "Pipeline is up and ingesting. Will share Looker link shortly.", time: "Sun", unread: 0, online: true },
];

/** @deprecated Prefer GET /api/taxonomy — fallback if API unavailable */
export const INDUSTRIES = [
  { name: "Medicine", icon: "🩺" },
  { name: "Art", icon: "🎨" },
  { name: "Finance", icon: "📈" },
  { name: "Education", icon: "🎓" },
  { name: "Marketing", icon: "📣" },
  { name: "Legal", icon: "⚖️" },
  { name: "Engineering", icon: "⚙️" },
  { name: "Creative", icon: "✨" },
  { name: "Research", icon: "🔬" },
  { name: "Other", icon: "🌐" },
];