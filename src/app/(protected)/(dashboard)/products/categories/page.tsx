import { CategoryDialogFormTrigger } from './_component/category-dialog';
import ProductCategoryList from './_component/product-category-lists';

export default function ProductCategoryPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Product Categories</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">Organize your menu into groups customers can browse.</p>
        </div>
        <CategoryDialogFormTrigger />
      </div>
      <ProductCategoryList />
    </div>
  );
}
