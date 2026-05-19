import path from 'node:path';
import dotenv from 'dotenv';
import { addDays } from 'date-fns';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
// import {
//   PrismaClient,
//   UserRole,
// } from '../dist/generated/prisma/client.js';
// import pkg from '@prisma/client';
// const { PrismaClient, UserRole } = pkg;
import {
  Customer,
  DeliveryType,
  PaymentMethod,
  PrismaClient,
  Product,
  SchedulerStatus,
  UserRole,
} from '../src/generated/prisma/client.js';
// import { PrismaClient, UserRole } from '@prisma/client';
// ─────────────────────────────────────────────
// CLI argument parsing
// ─────────────────────────────────────────────
const args = process.argv.slice(2);

function getFlag(name: string) {
  const flag = args.find((a) => a.startsWith(`--${name}=`));
  return flag ? parseInt(flag.split('=')[1], 10) : null;
}

const hasFlag = (name: string) => args.includes(`--${name}`);

/**
 * Presets
 *   --light   → small dataset, great for development
 *   --standard → moderate dataset (default when no preset given)
 *   --heavy   → large dataset for stress / performance testing
 */
const PRESETS = {
  light: { users: 3, customers: 3, products: 5, schedulers: 5 },
  standard: { users: 10, customers: 5, products: 27, schedulers: 20 },
  heavy: { users: 30, customers: 15, products: 27, schedulers: 100 },
};

function resolveConfig() {
  let preset = PRESETS.standard;

  if (hasFlag('light')) preset = PRESETS.light;
  else if (hasFlag('heavy')) preset = PRESETS.heavy;
  else if (hasFlag('standard')) preset = PRESETS.standard;

  return {
    reset: hasFlag('reset'),
    users: getFlag('users') ?? preset.users,
    customers: getFlag('customers') ?? preset.customers, // standalone customers (no user)
    products: getFlag('products') ?? preset.products,
    schedulers: getFlag('schedulers') ?? preset.schedulers,
  };
}

const CONFIG = resolveConfig();

console.log('📋 Configuração do seed:', CONFIG);

// ─────────────────────────────────────────────
// Prisma setup
// ─────────────────────────────────────────────
const backendPath = path.dirname(path.join(process.argv[1] || '', '..'));
dotenv.config({ path: path.join(backendPath, '.env') });

const connectionString = `${process.env.DATABASE_URL}`;
const sqliteAdapter = new PrismaBetterSqlite3({ url: connectionString });
const pgAdapter = new PrismaPg({ connectionString });
const adapter = connectionString.includes('postgre') ? pgAdapter : sqliteAdapter;

const prisma = new PrismaClient({ adapter });

// bcrypt hash for "abc123"
const PASSWORD_HASH = '$2b$10$MS8IavIvPIjdjW.WfKPrQOOFlqLHxUxZTlPVsluxKpLKutgqwUI0K';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function randomFutureDate(daysAhead = 30) {
  return addDays(new Date(), Math.floor(Math.random() * daysAhead) + 1);
}

function randomInt(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function pickRandom(arr: any[], count: number) {
  return faker.helpers.arrayElements(arr, count);
}

// ─────────────────────────────────────────────
// Static seed data
// ─────────────────────────────────────────────
const FIXED_USERS = [
  { name: 'Admin User', email: 'admin@example.com', role: UserRole.admin },
  { name: 'Customer User', email: 'customer@example.com', role: UserRole.customer },
];

const CATEGORIES = [
  { name: 'Bolos', slug: 'bolos' },
  { name: 'Tortas', slug: 'tortas' },
  { name: 'Cupcakes', slug: 'cupcakes' },
  { name: 'Doces', slug: 'doces' },
  { name: 'Sobremesas', slug: 'sobremesas' },
  { name: 'Bolos de Casamento', slug: 'bolos-de-casamento' },
  { name: 'Bolos Decorados', slug: 'bolos-decorados' },
  { name: 'Cheesecakes', slug: 'cheesecakes' },
  { name: 'Brownies', slug: 'brownies' },
  { name: 'Macarons', slug: 'macarons' },
];

const CHARACTERISTICS = [
  { name: 'Sem glúten' },
  { name: 'Sem lactose' },
  { name: 'Vegano' },
  { name: 'Sem açúcar' },
  { name: 'Orgânico' },
  { name: 'Low carb' },
  { name: 'Sem conservantes' },
];

const PRODUCTS_DATA = [
  {
    productName: 'Amendoim & avelã',
    productDescription:
      'Biscoitos de amendoim, recheados com creme de avelã e pasta de amendoim',
  },
  {
    productName: 'Casadinho',
    productDescription:
      'Biscoitos recheados com goiabada artesanal (feita por vó com muito carinho)',
  },
  {
    productName: 'Biscoito de Baunilha e Ninho',
    productDescription: 'Biscoitos de baunilha sem recheio, passados no leite ninho',
  },
  {
    productName: 'Canelinha',
    productDescription: 'Biscoitos sem recheio aromatizados com canela',
  },
  {
    productName: 'Café e Avelã',
    productDescription: 'Biscoitos de café, recheados com creme de avelã',
  },
  {
    productName: 'Churrito',
    productDescription: 'Biscoitos aromatizados de canela, recheados com doce de leite',
  },
  {
    productName: 'Mousse de Queijo',
    productDescription:
      'Feita com parmesão e gorgonzola, finalizada com geleia de pimentões levemente apimentada',
  },
  {
    productName: 'Gelado de Tapioca',
    productDescription:
      'Bolo gelado de tapioca, com creme de leite condensado, leite de coco e coco, finalizado com farofinha de coco caramelizado',
  },
  {
    productName: 'Focaccia',
    productDescription:
      'Focaccia artesanal, macia por dentro, levemente crocante por fora, temperada com azeite de oliva, alecrim e um toque de sal marinho.',
  },
  {
    productName: 'Palmier',
    productDescription: 'Massa folhada levemente adocicada, com ou sem canela',
  },
  {
    productName: 'Bolo Caseiro',
    productDescription: 'Grande ou pequeno. Limão, laranja, tangerina',
  },
  {
    productName: 'Bolo de Cenoura',
    productDescription: 'Grande ou pequeno. Com ganache de chocolate ou brigadeiro',
  },
  {
    productName: 'Bolo de Ninho',
    productDescription:
      'Massa super fofinha de leite ninho, com brigadeiro de leite ninho',
  },
  {
    productName: 'Bolo de Limão e Mirtilo',
    productDescription:
      'Massa com suco de limão e mirtilos. Opção com ou sem brigadeiro de limão',
  },
  {
    productName: 'Bolo de Banana e Chocolate',
    productDescription: 'Massa de banana e cacau, com gotas de chocolate nobre blend',
  },
  {
    productName: 'Torta Salgada',
    productDescription: 'Recheada com legumes, carne moída ou frango',
  },
  {
    productName: 'Brownie',
    productDescription:
      'Brownie tradicional de chocolate nobre blend, macio por dentro e crocante por fora. Pedido mínimo: 50 unidades.',
  },
  {
    productName: 'Brigadeiro de Caramelo Crocante',
    productDescription:
      'Docinhos de caramelo passados no cereal crocante. Pedido mínimo: 50 unidades.',
  },
  {
    productName: 'Mini Brownie',
    productDescription:
      'Mini brownie tradicional de chocolate nobre blend, macio por dentro e crocante por fora',
  },
  {
    productName: 'Brigadeiro Tradicional Gourmet',
    productDescription:
      'Chocolate nobre blend passados no granulado 100% chocolate (vermicelli ou granule)',
  },
  {
    productName: 'Pipoca Gourmet',
    productDescription: 'Ninho + chocolate blend; Ninho + chocolate branco',
  },
  {
    productName: 'Brownie Blondie',
    productDescription:
      'Brownie de chocolate branco. Diversas opções, como: limão siciliano, frutas vermelhas, amêndoas',
  },
  {
    productName: 'Tarte Tartin',
    productDescription:
      'Torta francesa composta por uma massa amanteigada e maçãs caramelizadas',
  },
  {
    productName: 'Torta de Caramelo Salgado',
    productDescription: 'Massa de cacau, creme de chocolate e caramelo salgado',
  },
  {
    productName: 'Torta de Maracujá com Chocolate',
    productDescription:
      'Massa de cacau, mousse de maracujá e creme de chocolate, finalizada com geleia de maracujá',
  },
  {
    productName: 'Torta de Fruta',
    productDescription: 'Base neutra, creme patisserie e geleia de fruta (a sua escolha)',
  },
  {
    productName: 'Pudim de Leite Condensado',
    productDescription:
      'Pudim cremoso feito com leite condensado e calda de caramelo dourado.',
  },
];

const PAYMENT_METHODS = [
  'credit_card',
  'bank_transfer',
  'pix',
  'cash',
] as PaymentMethod[];
const DELIVERY_TYPES = ['delivery', 'pickup'] as DeliveryType[];
const STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
] satisfies SchedulerStatus[];

const ABOUT_TEXT = [{title: 'Título Sobre', subtitle: 'Subtítulo', main: 'Texto principal da tela', complementary: 'Texto Adicional'}]

// ─────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────
async function resetDatabase() {
  console.log('🗑️  Resetando base de dados…');

  // Delete in dependency order
  await prisma.schedulerItem.deleteMany();
  await prisma.scheduler.deleteMany();
  await prisma.productCharacteristic.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.characteristic.deleteMany();
  await prisma.recoveryCode.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.googleCredentials.deleteMany();
  await prisma.aboutInfo.deleteMany();
  await prisma.aboutItem.deleteMany();

  console.log('✅ Base de dados limpa.');
}

// ─────────────────────────────────────────────
// Seed: Characteristics
// ─────────────────────────────────────────────
async function seedCharacteristics() {
  const result = [];

  for (const ch of CHARACTERISTICS) {
    const existing = await prisma.characteristic.findFirst({ where: { name: ch.name } });

    if (existing) {
      result.push(existing);
    } else {
      const created = await prisma.characteristic.create({ data: { name: ch.name } });
      result.push(created);
    }
  }

  console.log(`✅ ${result.length} características prontas.`);
  return result;
}

// ─────────────────────────────────────────────
// Seed: Categories
// ─────────────────────────────────────────────
async function seedCategories() {
  const result = [];

  for (const [index, cat] of CATEGORIES.entries()) {
    if (CONFIG.reset) {
      // already wiped; just create
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          orderIndex: index,
          description: faker.lorem.sentence(),
        },
      });
      result.push(created);
    } else {
      // upsert-like: skip if slug exists
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (existing) {
        result.push(existing);
      } else {
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            orderIndex: index,
            description: faker.lorem.sentence(),
          },
        });
        result.push(created);
      }
    }
  }

  console.log(`✅ ${result.length} categorias prontas.`);
  return result;
}

// ─────────────────────────────────────────────
// Seed: Products
// ─────────────────────────────────────────────
async function seedProducts(characteristics: any[], categories: any[]) {
  const slice = PRODUCTS_DATA.slice(0, CONFIG.products);
  const result = [];

  for (const p of slice) {
    const slug = generateSlug(p.productName);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && !CONFIG.reset) {
      result.push(existing);
      continue;
    }

    const selectedCharacteristics = pickRandom(
      characteristics,
      faker.number.int({ min: 0, max: 3 }),
    );

    const selectedCategories = pickRandom(
      categories,
      faker.number.int({ min: 1, max: 3 }),
    );

    const price = parseFloat((Math.random() * 100).toFixed(2));
    const estimatedMinPrice = parseFloat((price * 0.8).toFixed(2));
    const estimatedMaxPrice = parseFloat((price * 1.2).toFixed(2));

    const created = await prisma.product.create({
      data: {
        name: p.productName,
        description: p.productDescription,
        slug,
        price,
        estimatedMinPrice,
        estimatedMaxPrice,
        bookingLeadTimeMinutes: faker.number.int({ min: 0, max: 120 }),
        bookingLeadDays: faker.number.int({ min: 0, max: 7 }),
        isActive: true,
        characteristics: {
          create: selectedCharacteristics.map((ch) => ({
            characteristic: { connect: { id: ch.id } },
          })),
        },
        categories: {
          create: selectedCategories.map((cat) => ({
            category: { connect: { id: cat.id } },
          })),
        },
      },
    });

    result.push(created);
    console.log(`  Produto criado: ${created.name}`);
  }

  console.log(`✅ ${result.length} produtos prontos.`);
  return result;
}

// ─────────────────────────────────────────────
// Seed: Users + their linked Customers
// ─────────────────────────────────────────────
async function seedUsers() {
  const dynamicUsers = Array.from(
    { length: Math.max(0, CONFIG.users - FIXED_USERS.length) },
    () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: UserRole.customer,
    }),
  );

  const allUserDefs = [...FIXED_USERS, ...dynamicUsers];
  const createdUsers = [];
  const createdCustomers = [];

  for (const def of allUserDefs) {
    // In reset mode the table is already empty; in incremental mode skip duplicates.
    const existing = await prisma.user.findUnique({ where: { email: def.email } });
    if (existing && !CONFIG.reset) {
      // Fetch associated customer if any
      const existingCustomer = await prisma.customer.findUnique({
        where: { userId: existing.id },
      });
      createdUsers.push(existing);
      if (existingCustomer) createdCustomers.push(existingCustomer);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: def.name,
        email: def.email,
        password: PASSWORD_HASH,
        role: def.role,
      },
    });

    // Create a linked Customer for every user so schedulers can reference them
    const customer = await prisma.customer.create({
      data: {
        name: user.name,
        email: user.email,
        phone: faker.phone.number(),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        userId: user.id,
      },
    });

    createdUsers.push(user);
    createdCustomers.push(customer);

    console.log(`  Usuário criado: ${user.email} → Customer: ${customer.id}`);
  }

  console.log(
    `✅ ${createdUsers.length} usuários e ${createdCustomers.length} customers (vinculados) prontos.`,
  );
  return { users: createdUsers, linkedCustomers: createdCustomers };
}

// ─────────────────────────────────────────────
// Seed: Standalone Customers (no User)
// ─────────────────────────────────────────────
async function seedStandaloneCustomers() {
  const result = [];

  for (let i = 0; i < CONFIG.customers; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
        // userId intentionally omitted → standalone customer
      },
    });

    result.push(customer);
  }

  console.log(`✅ ${result.length} customers standalone (sem usuário) criados.`);
  return result;
}

// ─────────────────────────────────────────────
// Seed: Schedulers
// ─────────────────────────────────────────────
async function seedSchedulers(allCustomers: Customer[], products: Product[]) {
  if (products.length === 0) {
    console.warn('⚠️  Nenhum produto disponível para criar agendamentos.');
    return;
  }

  let created = 0;

  for (let i = 0; i < CONFIG.schedulers; i++) {
    const customer = faker.helpers.arrayElement(allCustomers);

    const selectedProducts = pickRandom(
      products,
      faker.number.int({ min: 1, max: Math.min(3, products.length) }),
    );

    const scheduledAt = randomFutureDate(60);
    const estimatedStart = addDays(scheduledAt, 0); // same day
    const totalDuration = selectedProducts.reduce(() => randomInt(30, 120), 0);
    const estimatedEnd = new Date(estimatedStart.getTime() + totalDuration * 60_000);

    await prisma.scheduler.create({
      data: {
        customerId: customer.id,
        scheduledAt,
        estimatedStartAt: estimatedStart,
        estimatedEndAt: estimatedEnd,
        status: faker.helpers.arrayElement(STATUSES),
        paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
        deliveryType: faker.helpers.arrayElement(DELIVERY_TYPES),
        cancellationReason: null,
        items: {
          create: selectedProducts.map((product, index) => ({
            productId: product.id,
            quantity: randomInt(1, 5),
            orderIndex: index + 1,
            priceAtBooking: product.price,
            durationMinutes: faker.number.int({ min: 30, max: 120 }),
          })),
        },
      },
    });

    created++;
  }

  console.log(`✅ ${created} agendamentos criados.`);
}

// ─────────────────────────────────────────────
// Seed: About + items
// ─────────────────────────────────────────────
async function seedAbout() {
  for (const about of ABOUT_TEXT) {
    await prisma.aboutInfo.create({
      data: {
        title: about.title,
        subtitle: about.subtitle,
        main: about.main,
        complementary: about.complementary,
      },
    });
  }

  console.log(`Textos Sobre criados`);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  if (CONFIG.reset) {
    await resetDatabase();
  }

  const characteristics = await seedCharacteristics();
  const categories = await seedCategories();
  const products = await seedProducts(characteristics, categories);
  const about = await seedAbout();

  const { linkedCustomers } = await seedUsers();
  const standaloneCustomers = await seedStandaloneCustomers();

  // Merge both groups so schedulers are spread across all customer types
  const allCustomers = [...linkedCustomers, ...standaloneCustomers];

  await seedSchedulers(allCustomers, products);

  console.log('\n🎉 Seed finalizado com sucesso!');
  console.log(`   Produtos:     ${products.length}`);
  console.log(`   Customers (vinculados):  ${linkedCustomers.length}`);
  console.log(`   Customers (standalone):  ${standaloneCustomers.length}`);
  console.log(`   Agendamentos: ${CONFIG.schedulers}`);
}

main()
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
