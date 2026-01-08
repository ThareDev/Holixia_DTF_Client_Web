import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import dbConnect from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import { authenticateToken } from '@/lib/middlewares/auth';

export async function POST(request: NextRequest) {
    try {
    const auth = authenticateToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Connect to database and fetch order
        await dbConnect();
        const order = await Order.findOne({ orderId });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Create zip file
        const zip = new JSZip();
        const imageFolder = zip.folder(orderId);

        if (!imageFolder) {
            return NextResponse.json(
                { success: false, message: 'Failed to create zip folder' },
                { status: 500 }
            );
        }

        // Fetch and add all images to zip
        const imagePromises = order.items.map(async (item, index) => {
            try {
                const response = await fetch(item.imageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                    },
                });
                
                if (!response.ok) {
                    console.error(`Failed to fetch image: ${item.fileName}, Status: ${response.status}`);
                    return null;
                }

                const arrayBuffer = await response.arrayBuffer();
                const fileName = `${index + 1}_${item.fileName}`;
                imageFolder.file(fileName, arrayBuffer);
                return fileName;
            } catch (error) {
                console.error(`Error fetching image ${item.fileName}:`, error);
                return null;
            }
        });

        const results = await Promise.all(imagePromises);
        const successCount = results.filter(r => r !== null).length;

        if (successCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Failed to download any images' },
                { status: 500 }
            );
        }

        // Generate zip file as blob
        const zipBlob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // Convert blob to buffer
        const arrayBuffer = await zipBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Return zip file
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${orderId}.zip"`,
                'Content-Length': buffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('Download images error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to download images' },
            { status: 500 }
        );
    }
}