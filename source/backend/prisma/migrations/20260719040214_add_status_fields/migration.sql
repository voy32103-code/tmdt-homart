-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "logistics_companies" ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "store_logistics_partners" ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';
