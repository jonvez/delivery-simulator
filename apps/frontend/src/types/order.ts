export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDetails: string | null;
  status: OrderStatus;
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
