-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" UUID,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed categories (industries)
INSERT INTO "Category" ("id", "name", "slug", "icon", "sortOrder") VALUES
  ('a0000001-0001-4001-8001-000000000001', 'Medicine', 'medicine', '🩺', 1),
  ('a0000001-0001-4001-8001-000000000002', 'Art', 'art', '🎨', 2),
  ('a0000001-0001-4001-8001-000000000003', 'Finance', 'finance', '📈', 3),
  ('a0000001-0001-4001-8001-000000000004', 'Education', 'education', '🎓', 4),
  ('a0000001-0001-4001-8001-000000000005', 'Marketing', 'marketing', '📣', 5),
  ('a0000001-0001-4001-8001-000000000006', 'Legal', 'legal', '⚖️', 6),
  ('a0000001-0001-4001-8001-000000000007', 'Engineering', 'engineering', '⚙️', 7),
  ('a0000001-0001-4001-8001-000000000008', 'Creative', 'creative', '✨', 8),
  ('a0000001-0001-4001-8001-000000000009', 'Research', 'research', '🔬', 9),
  ('a0000001-0001-4001-8001-00000000000a', 'Other', 'other', '🌐', 10);

-- Seed skills (canonical slugs for tags[])
INSERT INTO "Skill" ("id", "name", "slug", "categoryId", "sortOrder") VALUES
  ('b0000001-0001-4001-8001-000000000001', 'Large Language Models', 'llm', NULL, 1),
  ('b0000001-0001-4001-8001-000000000002', 'Natural Language Processing', 'nlp', NULL, 2),
  ('b0000001-0001-4001-8001-000000000003', 'Computer Vision', 'computer-vision', NULL, 3),
  ('b0000001-0001-4001-8001-000000000004', 'RAG', 'rag', NULL, 4),
  ('b0000001-0001-4001-8001-000000000005', 'Fine-tuning', 'fine-tuning', NULL, 5),
  ('b0000001-0001-4001-8001-000000000006', 'Machine Learning', 'machine-learning', NULL, 6),
  ('b0000001-0001-4001-8001-000000000007', 'Deep Learning', 'deep-learning', NULL, 7),
  ('b0000001-0001-4001-8001-000000000008', 'PyTorch', 'pytorch', NULL, 8),
  ('b0000001-0001-4001-8001-000000000009', 'TensorFlow', 'tensorflow', NULL, 9),
  ('b0000001-0001-4001-8001-00000000000a', 'Data Science', 'data-science', NULL, 10),
  ('b0000001-0001-4001-8001-00000000000b', 'MLOps', 'mlops', NULL, 11),
  ('b0000001-0001-4001-8001-00000000000c', 'Chatbots', 'chatbots', NULL, 12),
  ('b0000001-0001-4001-8001-00000000000d', 'AI Agents', 'ai-agents', NULL, 13),
  ('b0000001-0001-4001-8001-00000000000e', 'Prompt Engineering', 'prompt-engineering', NULL, 14),
  ('b0000001-0001-4001-8001-00000000000f', 'Speech & Audio', 'speech-audio', NULL, 15),
  ('b0000001-0001-4001-8001-000000000010', 'Generative AI', 'generative-ai', NULL, 16),
  ('b0000001-0001-4001-8001-000000000011', 'Python', 'python', NULL, 17),
  ('b0000001-0001-4001-8001-000000000012', 'TypeScript', 'typescript', NULL, 18),
  ('b0000001-0001-4001-8001-000000000013', 'API Integration', 'api-integration', NULL, 19),
  ('b0000001-0001-4001-8001-000000000014', 'Annotation & Labeling', 'annotation', NULL, 20);
