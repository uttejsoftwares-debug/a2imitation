import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: 'Necklaces', slug: 'necklaces' },
      { name: 'Earrings', slug: 'earrings' },
      { name: 'Rings', slug: 'rings' },
      { name: 'Bridal Sets', slug: 'bridal-sets' },
    ],
    skipDuplicates: true,
  });

  await prisma.brand.createMany({
    data: [
      { name: 'Aurelia', slug: 'aurelia' },
      { name: 'Velora', slug: 'velora' },
      { name: 'Luxe Glow', slug: 'luxe-glow' },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();

  const products = [
    {
      name: 'Celeste Necklace',
      slug: 'celeste-necklace',
      description: 'Luxurious bridal necklace with radiant detailing.',
      price: 4999,
      compareAtPrice: 6999,
      sku: 'CEL-001',
      stock: 12,
      isFeatured: true,
      isNew: true,
      isTrending: true,
      categoryId: categories[0]?.id ?? '',
      brandId: brands[0]?.id ?? '',
    },
    {
      name: 'Aurora Drop Earrings',
      slug: 'aurora-drop-earrings',
      description: 'Contemporary elegant earrings for evening wear.',
      price: 3499,
      compareAtPrice: 4999,
      sku: 'AUR-001',
      stock: 18,
      isFeatured: true,
      isNew: false,
      isTrending: true,
      categoryId: categories[1]?.id ?? '',
      brandId: brands[1]?.id ?? '',
    },
    {
      name: 'Velvet Bridal Set',
      slug: 'velvet-bridal-set',
      description: 'A captivating bridal set crafted for timeless glamour.',
      price: 8990,
      compareAtPrice: 12990,
      sku: 'VEL-001',
      stock: 8,
      isFeatured: true,
      isNew: true,
      isTrending: false,
      categoryId: categories[3]?.id ?? '',
      brandId: brands[2]?.id ?? '',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('Seed data complete');
}

main().finally(() => prisma.$disconnect());
