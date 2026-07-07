import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFallbackProductResponse } from './adminProductResponse.js';

test('buildFallbackProductResponse returns a product payload with uploaded images', () => {
  const response = buildFallbackProductResponse({
    name: 'Diamond Bridal Set',
    sku: 'DBS-100',
    price: 7999,
    stock: 15,
    categoryName: 'Bridal Sets',
    description: 'Multi-image upload demo',
    imageDataUrls: ['data:image/png;base64,abc', 'data:image/png;base64,def'],
  });

  assert.equal(response.name, 'Diamond Bridal Set');
  assert.equal(response.sku, 'DBS-100');
  assert.equal(response.price, 7999);
  assert.equal(response.stock, 15);
  assert.deepEqual(response.images, ['data:image/png;base64,abc', 'data:image/png;base64,def']);
  assert.equal(response.category.name, 'Bridal Sets');
});
