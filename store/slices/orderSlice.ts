import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PrintSize = 'A4' | 'A3';

export interface OrderItem {
  id: string;
  imagePreview: string;
  fileName: string;
  fileSize: number;
  size: PrintSize;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface OrderState {
  items: OrderItem[];
  totalAmount: number;
}

export const PRICE_PER_SIZE: Record<PrintSize, number> = {
  'A4': 200,   // LKR per print
  'A3': 400,   // LKR per print
};

const initialState: OrderState = {
  items: [],
  totalAmount: 0,
};

const calculateTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.totalPrice, 0);
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrderItem: (state, action: PayloadAction<Omit<OrderItem, 'pricePerUnit' | 'totalPrice'>>) => {
      const pricePerUnit = PRICE_PER_SIZE[action.payload.size];
      const totalPrice = pricePerUnit * action.payload.quantity;

      const newItem: OrderItem = {
        ...action.payload,
        pricePerUnit,
        totalPrice,
      };
      state.items.push(newItem);
      state.totalAmount = calculateTotal(state.items);
    },
    updateOrderItem: (state, action: PayloadAction<{ id: string; updates: Partial<OrderItem> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.updates,
        };

        // Recalculate price if size or quantity changed
        const item = state.items[index];
        item.pricePerUnit = PRICE_PER_SIZE[item.size];
        item.totalPrice = item.pricePerUnit * item.quantity;

        state.totalAmount = calculateTotal(state.items);
      }
    },
    removeOrderItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalAmount = calculateTotal(state.items);
    },
    clearOrder: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addOrderItem,
  updateOrderItem,
  removeOrderItem,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer;