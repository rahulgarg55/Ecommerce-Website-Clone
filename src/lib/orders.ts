export type OrderStatus = "pending" | "paid" | "payment_failed";

export type StoreOrder = {
  id: string;
  userId: string;
  email: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
};
