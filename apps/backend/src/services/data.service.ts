import prisma from '../db/client';
import { OrderStatus } from '@prisma/client';
import { BROOKLYN_ADDRESSES } from '../data/brooklyn-addresses';

/**
 * Data Management Service
 * Story 5.3: Implement Data Reset Functionality
 *
 * Provides data reset and regeneration capabilities
 */

// Sample data arrays
const DRIVER_NAMES = [
  'Mike Chen',
  'Sarah Johnson',
  'David Rodriguez',
  'Emily Williams',
  'James Thompson',
  'Maria Garcia',
  'Alex Kim',
  'Jessica Martinez',
];

const CUSTOMER_NAMES = [
  'John Smith',
  'Emma Davis',
  'Michael Brown',
  'Olivia Miller',
  'William Wilson',
  'Sophia Moore',
  'James Taylor',
  'Isabella Anderson',
  'Robert Thomas',
  'Mia Jackson',
  'Daniel White',
  'Charlotte Harris',
  'Matthew Martin',
  'Amelia Thompson',
  'Christopher Garcia',
  'Harper Martinez',
];

const ORDER_DETAILS = [
  '2 Large Pepperoni Pizzas, 1 Garlic Knots',
  'General Tso Chicken, Fried Rice, Spring Rolls',
  'Burger Deluxe Meal with Fries',
  'Pad Thai, Tom Yum Soup, Spring Rolls',
  'Caesar Salad, Grilled Chicken Sandwich',
  'Sushi Combo (24 pieces), Miso Soup',
  'BBQ Ribs Platter, Mac & Cheese',
  'Vegetarian Bowl, Fresh Juice',
  'Tacos (6), Chips and Guacamole',
  'Chicken Tikka Masala, Naan Bread',
  'Margherita Pizza, Caprese Salad',
  'Philly Cheesesteak, Onion Rings',
  'Greek Gyro Platter with Fries',
  'Chicken Wings (20), Blue Cheese',
  'Seafood Pasta, Garlic Bread',
];

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
 * Reset all data and regenerate seed data
 * Uses transaction to ensure atomic operation
 */
export async function resetData(): Promise<{
  driversCreated: number;
  ordersCreated: number;
}> {
  return await prisma.$transaction(async (tx) => {
    // Delete all existing data
    await tx.order.deleteMany({});
    await tx.driver.deleteMany({});

    // Create drivers (5-8 drivers)
    const driverData = DRIVER_NAMES.slice(0, 5 + Math.floor(Math.random() * 4)).map((name, index) => ({
      name,
      isAvailable: index < 3 || Math.random() > 0.4, // First 3 available, rest random
    }));

    const drivers = await Promise.all(
      driverData.map((data) => tx.driver.create({ data }))
    );

    // Create orders (15-25 orders)
    const orderCount = 15 + Math.floor(Math.random() * 11);
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
        assignedAt = new Date(createdAt.getTime() + Math.random() * 30 * 60 * 1000);
      } else if (statusRandom < 0.65) {
        // 15% in transit
        status = OrderStatus.IN_TRANSIT;
        driverId = randomItem(availableDrivers).id;
        assignedAt = new Date(createdAt.getTime() + Math.random() * 20 * 60 * 1000);
        inTransitAt = new Date(assignedAt.getTime() + Math.random() * 15 * 60 * 1000);
      } else {
        // 35% delivered
        status = OrderStatus.DELIVERED;
        driverId = Math.random() > 0.3 ? randomItem(drivers).id : randomItem(availableDrivers).id;
        assignedAt = new Date(createdAt.getTime() + Math.random() * 15 * 60 * 1000);
        inTransitAt = new Date(assignedAt.getTime() + Math.random() * 10 * 60 * 1000);
        deliveredAt = new Date(inTransitAt.getTime() + Math.random() * 30 * 60 * 1000);
      }

      const order = await tx.order.create({
        data: {
          customerName: randomItem(CUSTOMER_NAMES),
          customerPhone: randomPhone(),
          deliveryAddress: address.address,
          orderDetails: Math.random() > 0.2 ? randomItem(ORDER_DETAILS) : null,
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

    return {
      driversCreated: drivers.length,
      ordersCreated: orders.length,
    };
  });
}
