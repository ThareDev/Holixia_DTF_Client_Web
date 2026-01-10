import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrderItem {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'pdf';
  size: 'A4' | 'A3';
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  items: IOrderItem[];
  totalAmount: number;
  deliveryInfo: {
    fullName: string;
    address: string;
    contact1: string;
    contact2: string;
  };
  paymentInfo: {
    receiptUrl: string;
    receiptFileName: string;
    receiptFileSize: number;
    paymentDate: Date;
  };
  status: 'pending' | 'payment_verified' | 'processing' | 'delivered' | 'cancelled';
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true,
  },
  size: {
    type: String,
    enum: ['A4', 'A3'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function(items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryInfo: {
      fullName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      contact1: {
        type: String,
        required: true,
      },
      contact2: {
        type: String,
        default: '',
      },
    },
    paymentInfo: {
      receiptUrl: {
        type: String,
        required: true,
      },
      receiptFileName: {
        type: String,
        required: true,
      },
      receiptFileSize: {
        type: Number,
        required: true,
      },
      paymentDate: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'payment_verified', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order = (mongoose.models.Order as Model<IOrder>) || 
  mongoose.model<IOrder>('Order', OrderSchema);

export default Order;