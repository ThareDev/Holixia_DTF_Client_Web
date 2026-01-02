import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DeliveryInfo {
  fullName: string;
  address: string;
  contact1: string;
  contact2: string;
}

export interface PaymentInfo {
  receiptImage: File | null;
  receiptPreview: string;
  receiptFileName: string;
  receiptFileSize: number;
  paymentDate: string;
}

export type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

interface CheckoutState {
  currentStep: CheckoutStep;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  isDeliveryInfoComplete: boolean;
  isPaymentInfoComplete: boolean;
  orderId: string | null;
  orderDate: string | null;
}

const initialState: CheckoutState = {
  currentStep: 'delivery',
  deliveryInfo: {
    fullName: '',
    address: '',
    contact1: '',
    contact2: '',
  },
  paymentInfo: {
    receiptImage: null,
    receiptPreview: '',
    receiptFileName: '',
    receiptFileSize: 0,
    paymentDate: '',
  },
  isDeliveryInfoComplete: false,
  isPaymentInfoComplete: false,
  orderId: null,
  orderDate: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setDeliveryInfo: (state, action: PayloadAction<DeliveryInfo>) => {
      state.deliveryInfo = action.payload;
      state.isDeliveryInfoComplete = 
        !!action.payload.fullName && 
        !!action.payload.address && 
        !!action.payload.contact1;
    },
    setPaymentInfo: (state, action: PayloadAction<PaymentInfo>) => {
      state.paymentInfo = action.payload;
      state.isPaymentInfoComplete = !!action.payload.receiptImage;
    },
    setCheckoutStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep === 'delivery' && state.isDeliveryInfoComplete) {
        state.currentStep = 'payment';
      } else if (state.currentStep === 'payment' && state.isPaymentInfoComplete) {
        state.currentStep = 'confirmation';
      }
    },
    previousStep: (state) => {
      if (state.currentStep === 'payment') {
        state.currentStep = 'delivery';
      } else if (state.currentStep === 'confirmation') {
        state.currentStep = 'payment';
      }
    },
    confirmOrder: (state) => {
      state.orderId = 'ORD-' + Date.now().toString();
      state.orderDate = new Date().toISOString();
    },
    resetCheckout: (state) => {
      return initialState;
    },
  },
});

export const {
  setDeliveryInfo,
  setPaymentInfo,
  setCheckoutStep,
  nextStep,
  previousStep,
  confirmOrder,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;