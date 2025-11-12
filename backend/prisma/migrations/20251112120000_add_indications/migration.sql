-- Create Enum
CREATE TYPE "IndicationStatus" AS ENUM ('NEW', 'IN_CONTACT', 'CLOSED', 'DECLINED');

-- Alter Table: members
ALTER TABLE "members"
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create Table: indications
CREATE TABLE "indications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "from_member_id" TEXT NOT NULL,
    "to_member_id" TEXT NOT NULL,
    "contact_info" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IndicationStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "indications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "indications_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "indications_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "indications_from_member_id_idx" ON "indications"("from_member_id");
CREATE INDEX "indications_to_member_id_idx" ON "indications"("to_member_id");

