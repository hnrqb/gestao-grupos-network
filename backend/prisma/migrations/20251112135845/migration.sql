-- DropIndex
DROP INDEX "indications_from_member_id_idx";

-- DropIndex
DROP INDEX "indications_to_member_id_idx";

-- AlterTable
ALTER TABLE "indications" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "updated_at" DROP DEFAULT;
