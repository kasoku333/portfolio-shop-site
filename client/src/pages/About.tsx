import { Button } from "@/components/ui/button";
import Shell from "@/components/Shell";
import { Link } from "react-router-dom";

export default function About() {

  return (
    <Shell>

      {/* Header Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            閾ｪ蟾ｱ邏ｹ莉・
          </h2>
          <p className="text-lg text-muted-foreground">
            繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ縺ｨ縺励※縺ｮ遘√↓縺､縺・※縺皮ｴｹ莉九＠縺ｾ縺・
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {/* Profile Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-lg overflow-hidden border border-border" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">繝励Ο繝輔ぅ繝ｼ繝ｫ逕ｻ蜒・/p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif font-bold text-foreground">
                  繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ蜷・
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  繧､繝ｩ繧ｹ繝医∵ｼｫ逕ｻ縲∝ｰ剰ｪｬ繧貞宛菴懊☆繧九け繝ｪ繧ｨ繧､繧ｿ繝ｼ縺ｧ縺吶・
                  譌･縲・・蜑ｵ菴懈ｴｻ蜍輔ｒ騾壹§縺ｦ縲∵ｧ倥・↑菴懷刀繧剃ｸ也阜縺ｫ逋ｺ菫｡縺励※縺・∪縺吶・
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  繝・ず繧ｿ繝ｫ繧｢繝ｼ繝医°繧牙ｮ溽黄蝠・刀縺ｾ縺ｧ縲∝､壼ｲ舌↓繧上◆繧倶ｽ懷刀蛻ｶ菴懊↓蜿悶ｊ邨・ｓ縺ｧ縺・∪縺吶・
                  逧・ｧ倥・謾ｯ謠ｴ縺後∫ｧ√・蜑ｵ菴懈ｴｻ蜍輔・蜴溷虚蜉帙→縺ｪ縺｣縺ｦ縺・∪縺吶・
                </p>
                <div className="pt-4">
                  <Link to="/shop">
                    <Button className="w-full md:w-auto">
                      菴懷刀繧定ｦ九ｋ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Skills Section */}
            <div>
              <h3 className="text-2xl font-serif font-bold mb-8 text-foreground">
                繧ｹ繧ｭ繝ｫ繝ｻ蠕玲э蛻・㍽
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "繝・ず繧ｿ繝ｫ繧､繝ｩ繧ｹ繝・, description: "鬮倩ｧ｣蜒丞ｺｦ縺ｮ繝・ず繧ｿ繝ｫ繧｢繝ｼ繝亥宛菴・ },
                  { title: "貍ｫ逕ｻ蛻ｶ菴・, description: "繧ｹ繝医・繝ｪ繝ｼ諤ｧ縺ｮ縺ゅｋ貍ｫ逕ｻ菴懷刀" },
                  { title: "蟆剰ｪｬ蝓ｷ遲・, description: "諢滓ュ雎翫°縺ｪ蟆剰ｪｬ繝ｻ繧ｨ繝・そ繧､" },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-lg"
                    style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}
                  >
                    <h4 className="font-serif font-semibold text-foreground mb-2">
                      {skill.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {/* Message Section */}
            <div className="bg-card border border-border rounded-lg p-8" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'}}>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">
                繝｡繝・そ繝ｼ繧ｸ
              </h3>
              <p className="text-foreground leading-relaxed mb-4">
                縺薙・繧ｵ繧､繝医・縲∫ｧ√・蜑ｵ菴懈ｴｻ蜍輔・髮・､ｧ謌舌〒縺吶・
                縺薙％縺ｧ逧・ｧ倥→菴懷刀繧帝壹§縺ｦ縺､縺ｪ縺後ｊ縲・
                荳邱偵↓蜑ｵ騾縺ｮ蝟懊・繧貞・縺九■蜷医＞縺溘＞縺ｨ諤昴▲縺ｦ縺・∪縺吶・
              </p>
              <p className="text-foreground leading-relaxed">
                逧・ｧ倥・縺疲髪謠ｴ縺ｨ縺疲─諠ｳ縺後∫ｧ√・蜑ｵ菴懈ｴｻ蜍輔・貅舌→縺ｪ繧翫∪縺吶・
                縺懊・縲∽ｽ懷刀繧偵＃隕ｧ縺・◆縺縺阪√＃諢滓Φ繧偵♀閨槭°縺帙￥縺縺輔＞縲・
              </p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}








