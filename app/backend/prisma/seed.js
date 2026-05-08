import path from 'node:path';
import dotenv from 'dotenv';
import {addDays} from 'date-fns';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from "@faker-js/faker";
import {
  PrismaClient,
  UserRole
} from '../dist/generated/prisma/client.js';

const backendPath = path.dirname(path.join(process.argv[1] || '',
  '..'));
dotenv.config({ path: path.join(backendPath,
  '.env') });

const sqliteAdapter = new PrismaBetterSqlite3({ url: process.env['DATABASE_URL'] || '' });
const connectionString = `${process.env.DATABASE_URL}`;
const pgAdapter = new PrismaPg({ connectionString });
const adapter = connectionString.includes('postgre') ? pgAdapter : sqliteAdapter;

const prisma = new PrismaClient({ adapter });
const passwordHash = '$2b$10$MS8IavIvPIjdjW.WfKPrQOOFlqLHxUxZTlPVsluxKpLKutgqwUI0K'; // abc123

// data futura aleatória (até X dias no futuro)
function randomFutureDate(daysAhead = 30) {
  const daysToAdd = Math.floor(Math.random() * daysAhead) + 1;
  return addDays(new Date(), daysToAdd);
}

// inteiro aleatório
function randomInt(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const categories = [
  { name: "Bolos", slug: "bolos" },
  { name: "Tortas", slug: "tortas" },
  { name: "Cupcakes", slug: "cupcakes" },
  { name: "Doces", slug: "doces" },
  { name: "Sobremesas", slug: "sobremesas" },
  { name: "Bolos de Casamento", slug: "bolos-de-casamento" },
  { name: "Bolos Decorados", slug: "bolos-decorados" },
  { name: "Cheesecakes", slug: "cheesecakes" },
  { name: "Brownies", slug: "brownies" },
  { name: "Macarons", slug: "macarons" }
];

const productCharacteristics = [
  { name: "Sem glúten" },
  { name: "Sem lactose" },
  { name: "Vegano" },
  { name: "Sem açúcar" },
  { name: "Orgânico" },
  { name: "Low carb" },
  { name: "Sem conservantes" },
];

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // espaço vira hífen
    .replace(/-+/g, "-"); // remove hífens duplicados
}

async function main() {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.admin,
    },
    {
      name: 'Customer User',
      email: 'customer@example.com',
      role: UserRole.customer,
    }
  ];

  for (const [index, productCharacteristic] of productCharacteristics.entries()) {
    const existingCharacteristic = await prisma.characteristic.findFirst({
      where: { name: productCharacteristic.name },
    });
    if (existingCharacteristic) {
      productCharacteristics[index].id = existingCharacteristic.id;
      continue;
    }
    const result = await prisma.characteristic.create({
      data: {
        name: productCharacteristic.name,
      },
      select: {
        id: true
      }
    }).catch((error) => {
      console.error(`Erro ao criar característica: ${productCharacteristic.name}`, error.message);
      return null;
    });
    productCharacteristics[index].id = result.id;
  }

  for (const [index, category] of categories.entries()) {
    await prisma.category.deleteMany({
      where: { slug: category.slug },
    });
    await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        orderIndex: index,
        description: faker.lorem.sentence(),
      },
    });
  }

  const products = [
    {
      "productName": "Amendoim & avelã ",
      "productDescription": "Biscoitos de amendoim, recheados com creme de avelã e pasta de amendoim",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/amendoim e avela.png",
      "linkText": "Amendoim%20%26%20avel%C3%A3"
    },
    {
      "productName": "Casadinho",
      "productDescription": "Biscoitos recheados com goiabada artesanal (feita por vó com muito carinho)",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/casadinho.jpg",
      "linkText": "Casadinho%20Tradicional"
    },
    {
      "productName": "Biscoito de Baunilha e Ninho",
      "productDescription": "Biscoitos de baunilha sem recheio, passados no leite ninho",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/biscoitBaunilha.jpg",
      "linkText": "Biscoito%20de%20Baunilha%20e%20Ninho"
    },
    {
      "productName": "Canelinha",
      "productDescription": "Biscoitos sem recheio aromatizados com canela",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/canelinha.png",
      "linkText": "Canelinha"
    },
    {
      "productName": "Café e Avelã",
      "productDescription": "Biscoitos de café, recheados com creme de avelã",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/cafe e avela.png",
      "linkText": "Caf%C3%A9%20e%20Avel%C3%A3"
    },
    {
      "productName": "Churrito ",
      "productDescription": "Biscoitos aromatizados de canela, recheados com doce de leite",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/churrito.png",
      "linkText": "Churrito"
    },
    {
      "productName": "Mousse de Queijo",
      "productDescription": "Feita com parmesão e gorgonzola, finalizada com geleia de pimentões levemente apimentada",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/mousse de queijo.png",
      "linkText": "Mousse%20de%20Queijo"
    },
    {
      "productName": "Gelado de Tapioca",
      "productDescription": "Bolo gelado de tapioca, com creme de leite condensado, leite de coco e coco, finalizado com farofinha de coco caramelizado",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/gelado de tapioca.png",
      "linkText": "Gelado%20de%20Tapioca"
    },
    {
      "productName": "Focaccia",
      "productDescription": "Focaccia artesanal, macia por dentro, levemente crocante por fora, temperada com azeite de oliva, alecrim e um toque de sal marinho.",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/focaccia.png",
      "linkText": "Focaccia"
    },
    {
      "productName": "Palmier",
      "productDescription": "Massa folhada levemente adocicada, com ou sem canela",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/palmier.png",
      "linkText": "Palmier"
    },
    {
      "productName": "Bolo Caseiro",
      "productDescription": "Grande ou pequeno. Limão, laranja, tangerina",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/bol caseiro.png",
      "linkText": "Bolo%20Caseiro"
    },
    {
      "productName": "Bolo de Cenoura",
      "productDescription": "Grande ou pequeno. Com ganache de chocolate ou brigadeiro",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/bolo cenoura.png",
      "linkText": "Bolo%20de%20Cenoura"
    },
    {
      "productName": "Bolo de Ninho",
      "productDescription": "Massa super fofinha de leite ninho, com brigadeiro de leite ninho",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/bolo ninho.png",
      "linkText": "Bolo%20de%20Ninho"
    },
    {
      "productName": "Bolo de Limão e Mirtilo",
      "productDescription": "Massa com suco de limão e mirtilos. Opção com ou sem brigadeiro de limão",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/bolo limao mirtilo.jpg",
      "linkText": "Bolo%20de%20Lim%C3%A3o%20e%20Mirtilo"
    },
    {
      "productName": "Bolo de Banana e Chocolate",
      "productDescription": "Massa de banana e cacau, com gotas de chocolate nobre blend",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/bolo banana.png",
      "linkText": "Bolo%20de%20Banana%20e%20Chocolate"
    },
    {
      "productName": "Torta Salgada",
      "productDescription": "Recheada com legumes, carne moída ou frango",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/torta salgada.png",
      "linkText": "Torta%20Salgada"
    },
    {
      "productName": "Brownie",
      "productDescription": "Brownie tradicional de chocolate nobre blend, macio por dentro e crocante por fora. Pedido mínimo: 50 unidades. Consulte para outros sabores",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/brownie.png",
      "linkText": "Brownie"
    },
    {
      "productName": "Brigadeiro de Caramelo Crocante",
      "productDescription": "Docinhos de caramelo passados no cereal crocante. Pedido mínimo: 50 unidades. Consulte para outros sabores",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/brigadeiro caramelo.png",
      "linkText": "Brigadeiro%20de%20Caramelo%20Crocante"
    },
    {
      "productName": "Mini Brownie",
      "productDescription": "Mini brownie tradicional de chocolate nobre blend, macio por dentro e crocante por fora",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/mini brownie.png",
      "linkText": "Mini%20Brownie"
    },
    {
      "productName": "Brigadeiro Tradicional Gourmet",
      "productDescription": "Chocolate nobre blend passados no granulado 100% chocolate (vermicelli ou granule)",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/brigadeiro.png",
      "linkText": "Brigadeiro%20Tradicional%20Gourmet"
    },
    {
      "productName": "Pipoca Gourmet",
      "productDescription": "Ninho + chocolate blend; Ninho + chocolate branco",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/pipoca.png",
      "linkText": "Pipoca%20Gourmet"
    },
    {
      "productName": "Brownie Blondie",
      "productDescription": "Brownie de chocolate branco. Diversas opções, como: limão siciliano, frutas vermelhas, amêndoas",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/brownie blonde.png",
      "linkText": "Brownie%20Blondie"
    },
    {
      "productName": "Tarte Tartin",
      "productDescription": "Torta francesa composta por uma massa amanteigada e maçãs caramelizadas",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/tarte tartin.png",
      "linkText": "Tarte%20Tartin"
    },
    {
      "productName": "Torta de Caramelo Salgado",
      "productDescription": "Massa de cacau, creme de chocolate e caramelo salgado",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/torta caramelo salgado.png",
      "linkText": "Torta%20de%20Caramelo%20Salgado"
    },
    {
      "productName": "Torta de Maracujá com Chocolate",
      "productDescription": "Massa de cacau, mousse de maracujá e creme de chocolate, finalizada com geleia de maracujá",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/torta maracuja.png",
      "linkText": "Torta%20de%20Maracuj%C3%A1%20com%20Chocolate"
    },
    {
      "productName": "Torta de Fruta",
      "productDescription": "Base neutra, creme patisserie e geleia de fruta (a sua escolha)",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/torta fruta.png",
      "linkText": "Torta%20de%20Fruta"
    },
    {
      "productName": "Pudim de Leite Condensado",
      "productDescription": "Pudim cremoso feito com leite condensado e calda de caramelo dourado.",
      "productPrice": 10,
      "productImageUrl": "assets/imagensProdutos/pudim de leite.png",
      "linkText": "Pudim%20de%20Leite%20Condensado"
    }
  ];

  Array.from(Array(10)).forEach(() => {
    return users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: UserRole.customer,
    })
  });

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      await prisma.user.delete({
        where: { email: userData.email },
      });
      console.log(`Usuário existente removido: ${userData.email}`);
    }

    const userToSave = {
      name: userData.name,
      email: userData.email,
      password: passwordHash,
      role: userData.role,
    }

    if (userData.id) {
      userToSave.id = userData.id;
    }

    const user = await prisma.user.create({
      data: userToSave,
    });

    console.log(`Usuário criado - ID:${user.id} | E-mail: ${user.email}`);
  }

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.productName },
    });

    if (existingProduct) {
      continue;
      // await prisma.scheduler.deleteMany({
      //   where: {
      //     items: {
      //       some: { productId: existingProduct.id }
      //     }
      //   }
      // });
      // await prisma.product.deleteMany({
      //   where: { id: existingProduct.id },
      // });

      // console.log(`Produto existente removido`);
    }
    
    const characteristicsToConnect = faker.helpers.arrayElements(productCharacteristics, faker.number.int({ max: 3 }));
    const productToSave = {
      name: product.productName,
      description: product.productDescription,
      slug: generateSlug(product.productName),
      price: +(Math.random()*100).toFixed(2),
      estimatedMinPrice: 0,
      estimatedMaxPrice: 0,
      bookingLeadTimeMinutes: 0,
      bookingLeadDays: 0,
      characteristics: {
        create: characteristicsToConnect.map((productCharacteristic) => ({
          characteristic: {
            connect: { id: productCharacteristic.id }
          }
        }))
      },
    }
    const productCreated = await prisma.product.create({
      data: productToSave,
    });

    console.log(`Produto criado - ID:${productCreated.id} | Nome: ${productCreated.name}`);
  }

  const savedProducts = await prisma.product.findMany();
  console.log(`Total de produtos salvos: ${savedProducts.length}`);
  console.log(savedProducts.map(p => `ID:${p.id} | Nome: ${p.name}`).join('\n'));
  const savedUsers = await prisma.user.findMany();

  await Promise.all(Array.from(Array(10)).map(() => {
    const randomUser = faker.helpers.arrayElement(savedUsers);

    // escolhe 1 ou mais produtos
    const selectedProducts = faker.helpers.arrayElements(
      savedProducts,
      faker.number.int({ min: 1, max: 3 })
    );

    const selectPaymentMethod = faker.helpers.arrayElement(['credit_card', 'bank_transfer', 'pix', 'cash']);
    const selectDeliveryType = faker.helpers.arrayElement(['delivery', 'pickup']);
    const selectStatus = faker.helpers.arrayElement([
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled'
    ]);

    return prisma.scheduler.create({
      data: {
        customerId: randomUser.id,
        scheduledAt: randomFutureDate(),
        deliveryType: selectDeliveryType,
        paymentMethod: selectPaymentMethod,
        status: selectStatus,
        items: {
          create: selectedProducts.map((product, index) => ({
            productId: product.id,
            quantity: randomInt(), // Quantidade aleatória
            orderIndex: index + 1, // Índice do item
            priceAtBooking: product.price, // Preço no momento do agendamento
            durationMinutes: faker.number.int({ min: 30, max: 120 }), // Duração aleatória entre 30 e 120 minutos
          })),
        },
      },
    });
  }));

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());