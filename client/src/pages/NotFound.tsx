import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Shell>
      <section className="py-20 md:py-28">
        <div className="container max-w-xl text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">404</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            ページが見つかりません
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            お探しのページは見つかりませんでした。
            <br />
            移動または削除された可能性があります。
          </p>
          <div className="pt-4">
            <Link to="/">
              <Button>トップへ戻る</Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
