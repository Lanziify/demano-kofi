
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductViewPage({ params }: PageProps) {
  const { id } = await params;

  return <div className="relative p-6"></div>;
}
