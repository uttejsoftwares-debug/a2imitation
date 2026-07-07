export type AdminProductBody = {
  name: string;
  price: number;
  sku: string;
  stock?: number;
  description?: string;
  categoryName?: string;
  imageDataUrls?: string[];
};

export function buildFallbackProductResponse(body: AdminProductBody) {
  return {
    id: `fallback-${Date.now()}`,
    name: body.name,
    sku: body.sku,
    price: Number(body.price),
    stock: Number(body.stock || 10),
    description: body.description || 'Premium imitation jewellery product',
    category: {
      id: 'cat-fallback',
      name: body.categoryName || 'General',
      slug: (body.categoryName || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    brand: { id: 'brand-fallback', name: 'A2', slug: 'a2' },
    images: body.imageDataUrls || [],
    createdAt: new Date().toISOString(),
  };
}
