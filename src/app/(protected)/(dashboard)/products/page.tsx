import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductList from './_components/product-list';

export default function ProductPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Products</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">Manage the items available on your menu.</p>
        </div>
        <Button render={<Link href="/products/new" />} nativeButton={false}>
          New Product
        </Button>
      </div>
      <ProductList />
    </div>
  );
}
