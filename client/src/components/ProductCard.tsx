import { Link } from "react-router-dom";
import { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
          {product.tags[0]}
        </div>
      </div>
      <div className="space-y-2 px-5 pb-6 pt-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="text-base font-semibold text-foreground">
          ¥{product.price.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}
