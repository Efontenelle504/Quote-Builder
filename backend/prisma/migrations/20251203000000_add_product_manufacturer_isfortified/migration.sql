-- Add manufacturer and isFortified to products
ALTER TABLE "Product"
ADD COLUMN "manufacturer" TEXT,
ADD COLUMN "isFortified" BOOLEAN NOT NULL DEFAULT false;

