import { notFound } from 'next/navigation';
import { ProductService } from '@/feature/products/service/product.service';
import ProductForm from '../../_components/product-form';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const service = new ProductService();

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await service.getProductById(id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="relative p-6">
      <ProductForm product={product} />
    </div>
  );
}
