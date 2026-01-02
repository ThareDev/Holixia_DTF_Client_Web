import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import { authenticateToken } from '@/lib/middlewares/auth';
import { uploadToR2 } from '@/lib/cloudfare/r2';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse multipart form data
    const formData = await request.formData();
    
    // Extract delivery info
    const deliveryInfo = {
      fullName: formData.get('deliveryInfo.fullName') as string,
      address: formData.get('deliveryInfo.address') as string,
      contact1: formData.get('deliveryInfo.contact1') as string,
      contact2: (formData.get('deliveryInfo.contact2') as string) || '',
    };

    // Validate delivery info
    if (!deliveryInfo.fullName || !deliveryInfo.address || !deliveryInfo.contact1) {
      return NextResponse.json(
        { success: false, message: 'Delivery information is incomplete' },
        { status: 400 }
      );
    }

    // Extract payment receipt
    const receiptFile = formData.get('paymentReceipt') as File;
    if (!receiptFile) {
      return NextResponse.json(
        { success: false, message: 'Payment receipt is required' },
        { status: 400 }
      );
    }

    // Upload receipt to R2
    const receiptBuffer = Buffer.from(await receiptFile.arrayBuffer());
    const receiptUrl = await uploadToR2(
      receiptBuffer,
      receiptFile.name,
      receiptFile.type
    );

    // Extract order items
    const itemsJson = formData.get('items') as string;
    if (!itemsJson) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      );
    }

    const itemsData = JSON.parse(itemsJson);
    
    // Upload all item images and build items array
    const items = await Promise.all(
      itemsData.map(async (item: Record<string, unknown>, index: number) => {
        const imageFile = formData.get(`itemImage_${index}`) as File;
        if (!imageFile) {
          throw new Error(`Image for item ${index} is missing`);
        }

        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imageUrl = await uploadToR2(
          imageBuffer,
          imageFile.name,
          imageFile.type
        );

        return {
          imageUrl,
          fileName: item.fileName as string,
          fileSize: item.fileSize as number,
          size: item.size as 'A4' | 'A3',
          quantity: item.quantity as number,
          pricePerUnit: item.pricePerUnit as number,
          totalPrice: item.totalPrice as number,
        };
      })
    );

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString();

    // Create order
    const order = await Order.create({
      userId: auth.userId,
      orderId,
      items,
      totalAmount,
      deliveryInfo,
      paymentInfo: {
        receiptUrl,
        receiptFileName: receiptFile.name,
        receiptFileSize: receiptFile.size,
        paymentDate: new Date(),
      },
      status: 'pending',
      orderDate: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.orderId,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order creation error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}