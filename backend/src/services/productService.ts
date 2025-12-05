import { Prisma } from "@prisma/client";
import slugify from "slugify";
import { prisma } from "../lib/prisma";

export interface ProductInput {
  name: string;
  description?: string;
  unitPrice?: number;
  warrantyText?: string;
  scopeIntro?: string;
  scopeBullets?: string[];
  componentBullets?: string[];
  tags?: string[];
  imageUrl?: string;
  category?: string;
  manufacturer?: string;
  isFortified?: boolean;
  isCustom?: boolean;
  ownerEmail?: string;
  createdBy?: string;
  isApproved?: boolean;
}

const slugOptions = { lower: true, strict: true };

export const productService = {
  async list(options?: { includeUnapproved?: boolean; ownerEmail?: string }) {
    const { includeUnapproved, ownerEmail } = options || {};
    const where: Prisma.ProductWhereInput = {};
    if (!includeUnapproved) {
      where.isApproved = true;
    }
    if (ownerEmail) {
      where.OR = [
        { ownerEmail: ownerEmail.toLowerCase() },
        { ownerEmail: null },
      ];
    }
    return prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });
  },

  async getBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  },

  async create(input: ProductInput) {
    const slug = slugify(input.name, slugOptions);
    return prisma.product.create({
      data: {
        ...input,
        slug,
        scopeBullets: input.scopeBullets ?? [],
        componentBullets: input.componentBullets ?? [],
        tags: input.tags ?? [],
        category: input.category,
        manufacturer: input.manufacturer,
        isFortified: input.isFortified ?? false,
        ownerEmail: input.ownerEmail?.toLowerCase(),
        isApproved: input.isApproved ?? !input.isCustom,
      },
    });
  },

  async update(id: string, input: ProductInput) {
    const slug = slugify(input.name, slugOptions);
    return prisma.product.update({
      where: { id },
      data: {
        ...input,
        slug,
        scopeBullets: input.scopeBullets ?? [],
        componentBullets: input.componentBullets ?? [],
        tags: input.tags ?? [],
        category: input.category,
        manufacturer: input.manufacturer,
        isFortified: input.isFortified ?? false,
        ownerEmail: input.ownerEmail?.toLowerCase(),
      },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
