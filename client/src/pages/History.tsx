import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";

interface HistoryItem {
  date: string;
  title: string;
  description: string;
  category: "exhibition" | "publication" | "award" | "other";
}

const historyItems: HistoryItem[] = [
  {
    date: "2024蟷ｴ1譛・,
    title: "繝・ず繧ｿ繝ｫ繧｢繝ｼ繝亥ｱ慕､ｺ莨・髢句ぎ",
    description: "繧ｪ繝ｳ繝ｩ繧､繝ｳ繧ｮ繝｣繝ｩ繝ｪ繝ｼ縺ｧ譁ｰ菴懊う繝ｩ繧ｹ繝・0轤ｹ繧貞ｱ慕､ｺ縲ょ､壹￥縺ｮ繝輔ぃ繝ｳ縺九ｉ縺ｮ螂ｽ隧輔ｒ蠕励∪縺励◆縲・,
    category: "exhibition",
  },
  {
    date: "2023蟷ｴ11譛・,
    title: "貍ｫ逕ｻ菴懷刀縲散rban Tales縲丞・迚・,
    description: "蛻昴・蝠・･ｭ貍ｫ逕ｻ菴懷刀繧貞・迚医る剞螳夂沿縺ｯ縺吶＄縺ｫ螳悟｣ｲ縺ｨ縺ｪ繧翫∪縺励◆縲・,
    category: "publication",
  },
  {
    date: "2023蟷ｴ9譛・,
    title: "繧ｯ繝ｪ繧ｨ繧､繝・ぅ繝悶い繝ｯ繝ｼ繝牙女雉・,
    description: "繝・ず繧ｿ繝ｫ繧｢繝ｼ繝磯Κ髢縺ｧ譁ｰ莠ｺ雉槭ｒ蜿苓ｳ槭ゅ％繧後∪縺ｧ縺ｮ豢ｻ蜍輔′隱阪ａ繧峨ｌ縺ｾ縺励◆縲・,
    category: "award",
  },
  {
    date: "2023蟷ｴ7譛・,
    title: "蟆剰ｪｬ縲燦hispers of Time縲丞ｮ梧・",
    description: "髟ｷ邱ｨ蟆剰ｪｬ縺ｮ蝓ｷ遲・ｒ螳御ｺ・る崕蟄先嶌邀阪→縺励※驟堺ｿ｡髢句ｧ九・,
    category: "publication",
  },
  {
    date: "2023蟷ｴ5譛・,
    title: "SNS 繝輔か繝ｭ繝ｯ繝ｼ10荳・ｺｺ驕疲・",
    description: "繧ｽ繝ｼ繧ｷ繝｣繝ｫ繝｡繝・ぅ繧｢縺ｧ縺ｮ豢ｻ蜍輔′隧穂ｾ｡縺輔ｌ縲√ヵ繧ｩ繝ｭ繝ｯ繝ｼ謨ｰ縺・0荳・ｺｺ繧定ｶ・∴縺ｾ縺励◆縲・,
    category: "other",
  },
  {
    date: "2023蟷ｴ3譛・,
    title: "繝昴・繝医ヵ繧ｩ繝ｪ繧ｪ繧ｵ繧､繝磯幕險ｭ",
    description: "菴懷刀繧貞ｱ慕､ｺ繝ｻ雋ｩ螢ｲ縺吶ｋ縺溘ａ縺ｮ繧ｪ繝ｳ繝ｩ繧､繝ｳ繧ｹ繝医い繧偵が繝ｼ繝励Φ縲・,
    category: "other",
  },
];

export default function History() {

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exhibition: "bg-blue-100 text-blue-800",
      publication: "bg-purple-100 text-purple-800",
      award: "bg-amber-100 text-amber-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exhibition: "螻慕､ｺ莨・,
      publication: "蜃ｺ迚・,
      award: "蜿苓ｳ・,
      other: "縺昴・莉・,
    };
    return labels[category] || category;
  };

  return (
    <Shell>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            豢ｻ蜍募ｱ･豁ｴ
          </h2>
          <p className="text-lg text-muted-foreground">
            縺薙ｌ縺ｾ縺ｧ縺ｮ蜑ｵ菴懈ｴｻ蜍輔→荳ｻ縺ｪ螳溽ｸｾ繧偵＃邏ｹ莉九＠縺ｾ縺・
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {historyItems.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-accent mt-2"></div>
                  {idx !== historyItems.length - 1 && (
                    <div className="w-1 h-24 bg-border mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-accent">
                      {item.date}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 p-8 rounded-lg border border-border bg-card text-center" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
            <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">
              譛譁ｰ菴懷刀繧偵メ繧ｧ繝・け
            </h3>
            <p className="text-muted-foreground mb-6">
              縺薙ｌ縺ｾ縺ｧ縺ｮ豢ｻ蜍輔・荳ｭ縺ｧ逕溘∪繧後◆菴懷刀縺溘■繧偵＃隕ｧ縺上□縺輔＞
            </p>
            <Link to="/shop">
              <Button className="w-full md:w-auto">
                繧ｷ繝ｧ繝・・縺ｸ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}







