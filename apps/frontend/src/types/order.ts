export const OrderStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDetails: string | null;
  status: OrderStatus;
  driverId: string | null;
  driver: {
    id: string;
    name: string;
    isAvailable: boolean;
    createdAt: string;
  } | null;
  createdAt: string;
  assignedAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDetails?: string;
}

export interface UpdateOrderInput {
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderDetails?: string | null;
  status?: OrderStatus;
}
