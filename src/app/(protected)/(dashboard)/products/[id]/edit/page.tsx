import { notFound } from 'next/navigation';
import { ProductForm } from '@/feature/products/client';
import { ProductService } from '@/feature/products/server';

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
