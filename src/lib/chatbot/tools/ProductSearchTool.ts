import { BaseTool } from './BaseTool';
import { prisma } from '@/lib/prisma';

export class ProductSearchTool implements BaseTool {
  name = 'product_search';
  description = 'Tìm kiếm thông tin sản phẩm (giá bán, tồn kho, v.v.) trong cửa hàng ODS Store dựa trên tên game hoặc từ khóa. Luôn luôn gọi công cụ này khi khách hỏi về game cụ thể, giá cả, hoặc hỏi cửa hàng có bán game nào đó không.';
  
  parameters = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Tên game hoặc từ khóa sản phẩm cần tìm kiếm (ví dụ: "Hunt: Showdown", "GTA V", "Netflix")',
      },
    },
    required: ['query'],
  };

  async execute(args: any) {
    const { query } = args;

    try {
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: query,
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      if (products.length === 0) {
        // Fallback: split query into words and search again
        const words = query.split(' ').filter((w: string) => w.length > 2);
        if (words.length > 0) {
          const fallbackProducts = await prisma.product.findMany({
            where: {
              OR: words.map((w: string) => ({
                name: { contains: w }
              }))
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
          });
          
          if (fallbackProducts.length > 0) {
            return fallbackProducts.map(p => this.formatProduct(p));
          }
        }
        
        return { message: `Không tìm thấy sản phẩm nào khớp với từ khóa "${query}". Hãy khuyên khách hàng kiểm tra lại tên hoặc liên hệ admin.` };
      }

      return products.map(p => this.formatProduct(p));
    } catch (error) {
      console.error('Error in ProductSearchTool:', error);
      return { error: 'Không thể truy vấn cơ sở dữ liệu sản phẩm lúc này.' };
    }
  }

  private formatProduct(p: any) {
    const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
    const discountPrice = p.discountPrice
      ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
      : null;

    return {
      name: p.name,
      price: price.toLocaleString('vi-VN') + ' đ',
      discountPrice: discountPrice ? discountPrice.toLocaleString('vi-VN') + ' đ' : null,
      status: p.status !== false ? 'Còn hàng' : 'Hết hàng',
      category: p.category || 'Không có',
      platform: p.platform || 'Không có',
      deliveryMethod: p.deliveryMethod || 'Tự động',
      link: `/products/${p.slug}`,
    };
  }
}
