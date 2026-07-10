import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { buildFallbackProductResponse } from './adminProductResponse.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);

const uploadsRoot = process.env.UPLOADS_ROOT || (process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads'));
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
const uploadsDir = uploadsRoot;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `product-${suffix}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.log('SMTP disabled, email not sent:', { to, subject, html });
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@a2-imitation.com',
    to,
    subject,
    html,
  });
};

const buildWhatsappLink = (message: string) => {
  const phone = (process.env.WHATSAPP_NUMBER || '919999999999').replace(/[^0-9]/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${CLIENT_BASE_URL}/api/auth/google/callback`;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const buildOrderConfirmationMessage = (name: string, orderNumber: string, total: number) =>
  `Hello ${name}, your order ${orderNumber} has been received. Total: ₹${total}. We will reach out shortly to confirm your jewellery selection.`;

const buildEnquiryMessage = (name: string, email: string, phone: string, productName?: string) => {
  const productText = productName ? ` Interested in ${productName}.` : '';
  return `Hello A2 Jewellery, I am ${name} (${email}${phone ? `, ${phone}` : ''}).${productText} Please share availability and pricing.`;
};

const fallbackCategories = [
  { id: 'cat-1', name: 'Necklaces', slug: 'necklaces' },
  { id: 'cat-2', name: 'Earrings', slug: 'earrings' },
  { id: 'cat-3', name: 'Bridal Sets', slug: 'bridal-sets' },
  { id: 'cat-4', name: 'Rings', slug: 'rings' },
  { id: 'cat-5', name: 'Bangles', slug: 'bangles' },
  { id: 'cat-6', name: 'Pendants', slug: 'pendants' },
  { id: 'cat-7', name: 'Anklets', slug: 'anklets' },
];

const fallbackProducts = [
  { id: 'prod-1', name: 'Celeste Necklace', sku: 'CEL-001', stock: 12, price: 4999, category: fallbackCategories[0], brand: { name: 'Aurelia' } },
  { id: 'prod-2', name: 'Aurora Drop Earrings', sku: 'AUR-001', stock: 18, price: 3499, category: fallbackCategories[1], brand: { name: 'Velora' } },
  { id: 'prod-3', name: 'Velvet Bridal Set', sku: 'VEL-001', stock: 8, price: 8990, category: fallbackCategories[2], brand: { name: 'Luxe Glow' } },
  { id: 'prod-4', name: 'Solar Halo Ring', sku: 'SOL-101', stock: 20, price: 1999, category: fallbackCategories[3], brand: { name: 'Aurelia' } },
  { id: 'prod-5', name: 'Marigold Bangles (Set)', sku: 'MAR-210', stock: 15, price: 2599, category: fallbackCategories[4], brand: { name: 'Velora' } },
  { id: 'prod-6', name: 'Luna Pendant', sku: 'LUN-302', stock: 10, price: 1499, category: fallbackCategories[5], brand: { name: 'Luxe Glow' } },
  { id: 'prod-7', name: 'Pearl Anklet', sku: 'PEA-410', stock: 25, price: 899, category: fallbackCategories[6], brand: { name: 'Aurelia' } },
  { id: 'prod-8', name: 'Empress Necklace', sku: 'EMP-007', stock: 6, price: 7999, category: fallbackCategories[0], brand: { name: 'Luxe Glow' } },
  { id: 'prod-9', name: 'Twilight Studs', sku: 'TWS-009', stock: 30, price: 1299, category: fallbackCategories[1], brand: { name: 'Velora' } },
  { id: 'prod-10', name: 'Royal Bridal Set Deluxe', sku: 'RBL-100', stock: 4, price: 15990, category: fallbackCategories[2], brand: { name: 'Aurelia' } },
  { id: 'prod-11', name: 'Meadow Ring', sku: 'MED-115', stock: 22, price: 1099, category: fallbackCategories[3], brand: { name: 'Velora' } },
  { id: 'prod-12', name: 'Sapphire Pendant', sku: 'SAP-220', stock: 9, price: 2999, category: fallbackCategories[5], brand: { name: 'Luxe Glow' } },
];

const fallbackOrders = [
  { id: 'ord-1', orderNumber: 'A2-1001', status: 'Packed', total: 8990, createdAt: '2026-07-07T09:00:00.000Z' },
  { id: 'ord-2', orderNumber: 'A2-1002', status: 'Processing', total: 3499, createdAt: '2026-07-06T18:30:00.000Z' },
];

async function safeQuery<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database query failed, using fallback data:', error);
    return fallback;
  }
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'a2-api' });
});

app.get('/api/products', async (_req, res) => {
  const products = await safeQuery(
    () => prisma.product.findMany({ include: { category: true, brand: true, images: true }, take: 12, orderBy: { createdAt: 'desc' } }),
    fallbackProducts as never[],
  );
  res.json(products);
});

app.get('/api/categories', async (_req, res) => {
  const categories = await safeQuery(() => prisma.category.findMany(), fallbackCategories as never[]);
  res.json(categories);
});

app.get('/api/categories/:slug', async (req, res) => {
  const slug = req.params.slug;
  const category = await safeQuery(
    () => prisma.category.findFirst({ where: { slug }, include: { products: { include: { images: true, category: true, brand: true } } } }),
    { ...fallbackCategories.find((item) => item.slug === slug), products: fallbackProducts } as never,
  );
  res.json(category);
});

app.get('/api/products/:identifier', async (req, res) => {
  const identifier = req.params.identifier;
  const product = await safeQuery(
    () => prisma.product.findFirst({ where: { OR: [{ id: identifier }, { slug: identifier }] }, include: { category: true, brand: true, images: true } }),
    fallbackProducts.find((item) => item.id === identifier || item.sku === identifier) as never,
  );
  res.json(product);
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: password,
      },
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: String(error) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    // Attempt DB lookup
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.passwordHash === password) {
      return res.json({ id: user.id, email: user.email, name: user.name || '' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    // Fallback demo login when DB not available
    if (String(error).includes('DATABASE_URL') || String(error).includes('PrismaClientInitializationError')) {
      if (email === 'demo@a2-imitation.com' && password === 'demo') {
        return res.json({ id: 'demo-user', email: 'demo@a2-imitation.com', name: 'Demo User' });
      }
      return res.status(401).json({ message: 'Invalid demo credentials' });
    }

    return res.status(500).json({ message: 'Login failed', error: String(error) });
  }
});

app.get('/api/auth/google', (_req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google OAuth is not configured.' });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

const exchangeGoogleCode = async (code: string) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured.');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('Google access token not available');
  }

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const googleUser = await userInfoResponse.json();
  const email = googleUser.email as string;
  const name = googleUser.name as string;
  if (!email) {
    throw new Error('Unable to read Google user email');
  }

  let user;
  try {
    user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: { email, name, passwordHash: '' },
    });
  } catch (error) {
    console.error('Google login user upsert failed:', error);
    user = { id: `google-${Date.now()}`, email, name } as any;
  }

  return { id: user.id, email: user.email, name: user.name || name || '' };
};

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('Missing Google OAuth code');

  try {
    const clientUrl = CLIENT_BASE_URL.replace(/\/$/, '');
    return res.redirect(`${clientUrl}/auth/google/callback?code=${encodeURIComponent(code)}`);
  } catch (error) {
    console.error('Google callback redirect failed:', error);
    res.status(500).send(String(error) || 'Google login failed.');
  }
});

app.post('/api/auth/google/callback', async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code) return res.status(400).json({ message: 'Missing Google OAuth code' });

  try {
    const payload = await exchangeGoogleCode(code);
    res.json(payload);
  } catch (error) {
    console.error('Google callback exchange failed:', error);
    res.status(500).json({ message: String(error) || 'Google login failed.' });
  }
});

app.get('/api/featured', async (_req, res) => {
  const products = await safeQuery(
    () => prisma.product.findMany({ where: { isFeatured: true }, include: { images: true }, take: 6, orderBy: { createdAt: 'desc' } }),
    fallbackProducts as never[],
  );
  res.json(products);
});

app.get('/api/admin/dashboard', async (_req, res) => {
  const [productCount, orderCount, customerCount, categories, products, orders] = await Promise.all([
    safeQuery(() => prisma.product.count(), fallbackProducts.length),
    safeQuery(() => prisma.order.count(), fallbackOrders.length),
    safeQuery(() => prisma.user.count({ where: { role: 'customer' } }), 4),
    safeQuery(() => prisma.category.findMany(), fallbackCategories as never[]),
    safeQuery(() => prisma.product.findMany({ include: { category: true, brand: true }, take: 6, orderBy: { createdAt: 'desc' } }), fallbackProducts as never[]),
    safeQuery(() => prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' } }), fallbackOrders as never[]),
  ]);

  const revenue = await safeQuery(() => prisma.order.aggregate({ _sum: { total: true } }), { _sum: { total: 21890 } });

  res.json({
    stats: {
      products: productCount,
      orders: orderCount,
      customers: customerCount,
      revenue: Number(revenue._sum?.total || 0),
    },
    categories,
    products,
    orders,
  });
});

app.get('/api/admin/products', async (_req, res) => {
  const products = await safeQuery(
    () => prisma.product.findMany({ include: { category: true, brand: true }, orderBy: { createdAt: 'desc' } }),
    fallbackProducts as never[],
  );
  res.json(products);
});

app.post('/api/admin/products', upload.array('images', 6), async (req, res) => {
  const body = req.body as {
    name: string;
    price: number;
    sku: string;
    stock?: number;
    description?: string;
    categoryName?: string;
  };

  if (!body.name || !body.price || !body.sku) {
    return res.status(400).json({ message: 'Name, price, and SKU are required.' });
  }

  try {
    const brand = await prisma.brand.upsert({
      where: { slug: 'a2' },
      update: {},
      create: { name: 'A2', slug: 'a2' },
    });

    const categorySlug = (body.categoryName || 'General').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: body.categoryName || 'General', slug: categorySlug },
    });

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description || 'Premium imitation jewellery product',
        price: Number(body.price),
        sku: body.sku,
        stock: Number(body.stock || 10),
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    if (req.files && Array.isArray(req.files) && req.files.length) {
      await prisma.productImage.createMany({
        data: (req.files as Express.Multer.File[]).map((file, index) => ({
          productId: product.id,
          url: `/uploads/${file.filename}`,
          alt: `${body.name} image ${index + 1}`,
          isPrimary: index === 0,
        })),
      });
    }

    const response = await prisma.product.findUnique({ where: { id: product.id }, include: { images: true, category: true, brand: true } });
    res.status(201).json(response);
  } catch (error) {
    if (String(error).includes('DATABASE_URL') || String(error).includes('PrismaClientInitializationError')) {
      res.status(201).json(buildFallbackProductResponse(body));
      return;
    }

    res.status(500).json({ message: 'Unable to create product.', error: String(error) });
  }
});

app.put('/api/admin/products/:id', upload.array('images', 6), async (req, res) => {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const body = req.body as {
    name?: string;
    price?: number;
    sku?: string;
    stock?: number;
    description?: string;
    categoryName?: string;
  };

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId }, include: { images: true } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    let categoryId = existing.categoryId;
    if (body.categoryName) {
      const categorySlug = body.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await prisma.category.upsert({ where: { slug: categorySlug }, update: {}, create: { name: body.categoryName, slug: categorySlug } });
      categoryId = category.id;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name ?? existing.name,
        price: typeof body.price === 'number' ? body.price : existing.price,
        sku: body.sku ?? existing.sku,
        stock: typeof body.stock === 'number' ? body.stock : existing.stock,
        description: body.description ?? existing.description,
        categoryId,
      },
    });

    if (req.files && Array.isArray(req.files) && req.files.length) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: (req.files as Express.Multer.File[]).map((file, index) => ({
          productId,
          url: `/uploads/${file.filename}`,
          alt: `${updated.name} image ${index + 1}`,
          isPrimary: index === 0,
        })),
      });
    }

    const result = await prisma.product.findUnique({ where: { id: productId }, include: { images: true, category: true, brand: true } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update product', error: String(error) });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const productId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete product', error: String(error) });
  }
});

app.get('/api/admin/orders', async (_req, res) => {
  const orders = await safeQuery(() => prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' } }), fallbackOrders as never[]);
  res.json(orders);
});

app.get('/api/orders', async (req, res) => {
  const userEmail = String(req.query.email || '').trim();
  if (!userEmail) return res.status(400).json({ message: 'Email query parameter is required' });

  try {
    const orders = await prisma.order.findMany({
      where: { user: { email: userEmail } },
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load orders', error: String(error) });
  }
});

app.post('/api/orders', async (req, res) => {
  const body = req.body as {
    userEmail: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: string;
  };

  if (!body.userEmail || !body.name || !body.items?.length) {
    return res.status(400).json({ message: 'Missing required order information' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: body.userEmail },
      update: { name: body.name },
      create: { email: body.userEmail, name: body.name, role: 'customer' },
    });

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((item) => item.productId) } },
      include: { images: true },
    });
    const orderItems = body.items.map((item) => {
      const product = products.find((p: any) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product ? product.price : 0,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: `A2-${Date.now()}`,
        userId: user.id,
        total,
        currency: 'INR',
        status: 'pending',
        items: { create: orderItems },
      },
      include: { items: true },
    });

    const emailHtml = `<h1>Order Confirmation</h1><p>Thanks for your order, ${body.name}.</p><p>Order number: ${order.orderNumber}</p><p>Total: ₹${order.total}</p>`;
    await sendEmail(body.userEmail, 'A2 Order Confirmation', emailHtml);

    const whatsappText = buildOrderConfirmationMessage(body.name, order.orderNumber, order.total);
    const whatsappLink = buildWhatsappLink(whatsappText);

    res.status(201).json({ order, whatsappLink });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create order', error: String(error) });
  }
});

app.post('/api/orders/:id/confirm', async (req, res) => {
  const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'confirmed' }, include: { user: true, items: { include: { product: true } } } });

    const emailHtml = `<h1>Order Confirmed</h1><p>Your order ${order.orderNumber} is confirmed.</p><p>Total: ₹${order.total}</p>`;
    await sendEmail(order.user.email, 'A2 Order Confirmed', emailHtml);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Unable to confirm order', error: String(error) });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
          { user: { email: orderId } },
        ],
      },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) {
      const fallback = fallbackOrders.find((item) => item.orderNumber === orderId || item.id === orderId);
      if (fallback) {
        return res.json({ ...fallback, items: [], user: { email: 'guest@a2-imitation.com', name: 'Guest' } });
      }
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch order', error: String(error) });
  }
});

app.post('/api/contact/whatsapp', async (req, res) => {
  const { message, name, email, phone, productName } = req.body as { message?: string; name?: string; email?: string; phone?: string; productName?: string };
  const finalMessage = message || buildEnquiryMessage(name || 'customer', email || 'support@a2-imitation.com', phone || '', productName);
  const link = buildWhatsappLink(finalMessage);
  res.json({ link });
});

app.post('/api/contact/email', async (req, res) => {
  const { email, name, subject, message } = req.body as { email: string; name: string; subject: string; message: string };
  if (!email || !subject || !message) return res.status(400).json({ message: 'Missing email fields' });
  await sendEmail(process.env.SUPPORT_EMAIL || 'support@a2-imitation.com', `Contact form: ${subject}`, `<p>From: ${name} &lt;${email}&gt;</p><p>${message}</p>`);
  res.json({ success: true });
});

app.post('/api/payments/checkout', async (req, res) => {
  const { orderId, provider, method, amount, items } = req.body as { orderId?: string; provider: string; method: string; amount: number; items?: Array<{ productId: string; quantity: number; price: number }> };
  if (!provider || !method || !amount) return res.status(400).json({ message: 'Missing payment fields' });
  const paymentOrderId = orderId || `cart-${Date.now()}`;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ message: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
  }

  const amountInPaise = Math.round(amount * 100);
  const orderPayload = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${paymentOrderId}_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed', errorText);
      return res.status(500).json({ message: 'Unable to create Razorpay order', error: errorText });
    }

    const razorpayOrder = await razorpayResponse.json();

    const payment = await prisma.payment.create({
      data: {
        orderId: paymentOrderId,
        userId: '000000000000000000000000',
        provider,
        method,
        amount,
        currency: 'INR',
        status: 'pending',
      },
    });

    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      receipt: razorpayOrder.receipt,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Checkout error', error);
    return res.status(500).json({ message: 'Checkout failed', error: String(error) });
  }
});

app.post('/api/payments/:id/complete', async (req, res) => {
  const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const payment = await prisma.payment.update({ where: { id: paymentId }, data: { status: 'completed', transactionId: `txn_${Date.now()}` } });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update payment', error: String(error) });
  }
});

app.post('/api/admin/categories', async (req, res) => {
  const { name, slug } = req.body as { name: string; slug?: string };
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const categorySlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.create({ data: { name, slug: categorySlug } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create category', error: String(error) });
  }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const hasProducts = await prisma.product.count({ where: { categoryId: id } });
    if (hasProducts) return res.status(400).json({ message: 'Cannot delete category with products' });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete category', error: String(error) });
  }
});

export default app;
