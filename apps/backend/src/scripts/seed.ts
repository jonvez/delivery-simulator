import prisma from '../db/client';
import { OrderStatus } from '@prisma/client';
import { BROOKLYN_ADDRESSES } from '../data/brooklyn-addresses';
import { REP_NAMES, STORE_ACCOUNTS, DELIVERY_ITEMS } from '../data/dsd-seed-data';

/**
 * Seed Data Generation Script
 * Story 5.2: Build Seed Data Generation System
 *
 * Creates realistic sample route reps and store deliveries for demonstration
 * purposes. Seed content lives in ../data/dsd-seed-data. Run with: npm run seed
 */

/**
 * Get a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random phone number
 */
function randomPhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${exchange}${number}`;
}

/**
 * Get random past date within specified hours
 */
function randomPastDate(hoursAgo: number): Date {
  const now = new Date();
  const millisecondsAgo = hoursAgo * 60 * 60 * 1000;
  const randomTime = Math.random() * millisecondsAgo;
  return new Date(now.getTime() - randomTime);
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting seed data generation...\n');

  // Clean existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.order.deleteMany({});
  await prisma.driver.deleteMany({});
  console.log('✓ Existing data cleared\n');

  // Create route reps
  console.log('🚚 Creating route reps...');
  const driverData = REP_NAMES.slice(0, 5 + Math.floor(Math.random() * 4)).map((name, index) => ({
    name,
    isAvailable: index < 3 || Math.random() > 0.4, // First 3 available, rest random
  }));

  const drivers = await Promise.all(
    driverData.map((data) => prisma.driver.create({ data }))
  );

  console.log(`✓ Created ${drivers.length} route reps:`);
  drivers.forEach((driver) => {
    console.log(`  - ${driver.name} (${driver.isAvailable ? 'On route' : 'Off route'})`);
  });
  console.log('');

  // Create store deliveries
  console.log('📦 Creating store deliveries...');
  const orderCount = 15 + Math.floor(Math.random() * 11); // 15-25 orders
  const availableDrivers = drivers.filter(d => d.isAvailable);

  const orders = [];
  for (let i = 0; i < orderCount; i++) {
    const address = randomItem(BROOKLYN_ADDRESSES);
    const createdAt = randomPastDate(8); // Within last 8 hours

    // Determine order status (weighted distribution)
    const statusRandom = Math.random();
    let status: OrderStatus;
    let driverId: string | undefined;
    let assignedAt: Date | undefined;
    let inTransitAt: Date | undefined;
    let deliveredAt: Date | undefined;

    if (statusRandom < 0.3) {
      // 30% pending
      status = OrderStatus.PENDING;
    } else if (statusRandom < 0.5) {
      // 20% assigned
      status = OrderStatus.ASSIGNED;
      driverId = randomItem(availableDrivers).id;
      assignedAt = new Date(createdAt.getTime() + Math.random() * 30 * 60 * 1000); // 0-30 min after created
    } else if (statusRandom < 0.65) {
      // 15% in transit
      status = OrderStatus.IN_TRANSIT;
      driverId = randomItem(availableDrivers).id;
      assignedAt = new Date(createdAt.getTime() + Math.random() * 20 * 60 * 1000);
      inTransitAt = new Date(assignedAt.getTime() + Math.random() * 15 * 60 * 1000); // 0-15 min after assigned
    } else {
      // 35% delivered
      status = OrderStatus.DELIVERED;
      driverId = Math.random() > 0.3 ? randomItem(drivers).id : randomItem(availableDrivers).id; // Sometimes unavailable drivers have delivered orders
      assignedAt = new Date(createdAt.getTime() + Math.random() * 15 * 60 * 1000);
      inTransitAt = new Date(assignedAt.getTime() + Math.random() * 10 * 60 * 1000);
      deliveredAt = new Date(inTransitAt.getTime() + Math.random() * 30 * 60 * 1000); // 0-30 min delivery time
    }

    const order = await prisma.order.create({
      data: {
        customerName: randomItem(STORE_ACCOUNTS),
        customerPhone: randomPhone(),
        deliveryAddress: address.address,
        orderDetails: Math.random() > 0.2 ? randomItem(DELIVERY_ITEMS) : null, // 80% have a case list
        status,
        latitude: address.latitude,
        longitude: address.longitude,
        driverId,
        createdAt,
        assignedAt,
        inTransitAt,
        deliveredAt,
      },
    });

    orders.push(order);
  }

  console.log(`✓ Created ${orders.length} store deliveries:`);
  const statusCounts = {
    [OrderStatus.PENDING]: orders.filter(o => o.status === OrderStatus.PENDING).length,
    [OrderStatus.ASSIGNED]: orders.filter(o => o.status === OrderStatus.ASSIGNED).length,
    [OrderStatus.IN_TRANSIT]: orders.filter(o => o.status === OrderStatus.IN_TRANSIT).length,
    [OrderStatus.DELIVERED]: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
  };
  console.log(`  - Scheduled: ${statusCounts.PENDING}`);
  console.log(`  - Assigned: ${statusCounts.ASSIGNED}`);
  console.log(`  - En route: ${statusCounts.IN_TRANSIT}`);
  console.log(`  - Delivered: ${statusCounts.DELIVERED}`);
  console.log('');

  console.log('✨ Seed data generation complete!\n');
  console.log('Summary:');
  console.log(`  🚚 ${drivers.length} route reps created`);
  console.log(`  📦 ${orders.length} store deliveries created`);
  console.log(`  🗺️  ${new Set(orders.map(o => o.deliveryAddress)).size} unique store locations (Brooklyn)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
