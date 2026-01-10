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
        const filesFolder = zip.folder(orderId);

        if (!filesFolder) {
            return NextResponse.json(
                { success: false, message: 'Failed to create zip folder' },
                { status: 500 }
            );
        }

        // Fetch and add all files (images and PDFs) to zip
        const filePromises = order.items.map(async (item, index) => {
            try {
                const response = await fetch(item.imageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                    },
                });
                
                if (!response.ok) {
                    console.error(`Failed to fetch file: ${item.fileName}, Status: ${response.status}`);
                    return null;
                }

                const arrayBuffer = await response.arrayBuffer();
                
                // Determine file extension based on fileType
                let fileName: string;
                const fileType = item.fileType || 'image';
                
                if (fileType === 'pdf') {
                    // Ensure PDF extension
                    const hasExtension = item.fileName.toLowerCase().endsWith('.pdf');
                    fileName = hasExtension 
                        ? `${index + 1}_${item.fileName}` 
                        : `${index + 1}_${item.fileName}.pdf`;
                } else {
                    // For images, keep original filename
                    fileName = `${index + 1}_${item.fileName}`;
                }
                
                filesFolder.file(fileName, arrayBuffer);
                return fileName;
            } catch (error) {
                console.error(`Error fetching file ${item.fileName}:`, error);
                return null;
            }
        });

        const results = await Promise.all(filePromises);
        const successCount = results.filter(r => r !== null).length;

        if (successCount === 0) {
            return NextResponse.json(
                { success: false, message: 'Failed to download any files' },
                { status: 500 }
            );
        }

        // Add payment receipt to zip if available
        try {
            if (order.paymentInfo?.receiptUrl) {
                const receiptResponse = await fetch(order.paymentInfo.receiptUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                    },
                });

                if (receiptResponse.ok) {
                    const receiptBuffer = await receiptResponse.arrayBuffer();
                    const receiptFileName = order.paymentInfo.receiptFileName || 'payment_receipt';
                    filesFolder.file(`RECEIPT_${receiptFileName}`, receiptBuffer);
                }
            }
        } catch (error) {
            console.error('Error adding payment receipt:', error);
            // Continue even if receipt fails - don't break the whole download
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
        console.error('Download files error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to download files' },
            { status: 500 }
        );
    }
}