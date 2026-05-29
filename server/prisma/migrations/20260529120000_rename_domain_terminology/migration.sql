-- Rename domain terminology (Order→Project, CUSTOMER→CLIENT, etc.)
-- Safe for existing Supabase data: renames preserve rows.

-- Enums
ALTER TYPE "Role" RENAME VALUE 'CUSTOMER' TO 'CLIENT';
ALTER TYPE "Role" RENAME VALUE 'EXECUTOR' TO 'FREELANCER';
ALTER TYPE "OrderStatus" RENAME TO "ProjectStatus";

-- Tables
ALTER TABLE "Order" RENAME TO "Project";
ALTER TABLE "OrderResponse" RENAME TO "Proposal";
ALTER TABLE "Offer" RENAME TO "Solution";
ALTER TABLE "Complaint" RENAME TO "Report";

-- Project (formerly Order)
ALTER TABLE "Project" RENAME COLUMN "authorId" TO "clientId";
ALTER TABLE "Project" RENAME COLUMN "executorId" TO "freelancerId";

-- Proposal (formerly OrderResponse)
ALTER TABLE "Proposal" RENAME COLUMN "orderId" TO "projectId";
ALTER TABLE "Proposal" RENAME COLUMN "executorId" TO "freelancerId";
ALTER TABLE "Proposal" RENAME COLUMN "message" TO "coverLetter";
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "proposedBudget" TEXT;
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "estimatedDays" INTEGER;

-- Review
ALTER TABLE "Review" RENAME COLUMN "orderId" TO "projectId";

-- Solution (formerly Offer)
ALTER TABLE "Solution" RENAME COLUMN "authorId" TO "freelancerId";

-- Report (formerly Complaint)
ALTER TABLE "Report" RENAME COLUMN "authorId" TO "reporterId";
