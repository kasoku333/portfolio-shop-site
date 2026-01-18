export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  tags: string[];
  images: string[];
  specs: ProductSpec[];
};

export const products: Product[] = [
  {
    id: "aurora-print",
    name: "Aurora Print",
    price: 4800,
    shortDescription: "光のグラデーションを閉じ込めたアートプリント。",
    description:
      "夜明け直前の空気感を抽象的に描いたアートプリント。紙質はマットで、光の反射を抑えた落ち着きのある仕上がりです。",
    tags: ["限定", "A3", "直筆サイン"],
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "サイズ", value: "A3 (297×420mm)" },
      { label: "用紙", value: "マットアート紙 190kg" },
      { label: "付属", value: "エディション証明書" },
      { label: "発送", value: "3-5営業日以内" },
    ],
  },
  {
    id: "midnight-soundtrack",
    name: "Midnight Soundtrack",
    price: 3200,
    shortDescription: "小説「Midnight」シリーズの挿絵冊子。",
    description:
      "物語の世界観を深める全24ページの挿絵冊子。限定表紙と小説の書き下ろし短編付き。",
    tags: ["冊子", "24P", "限定表紙"],
    images: [
      "https://images.unsplash.com/photo-1473197456076-d9a1723b545b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1457694587812-e8bf29a43845?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "ページ", value: "24ページ" },
      { label: "サイズ", value: "B5" },
      { label: "綴じ", value: "中綴じ" },
      { label: "発送", value: "2-4営業日以内" },
    ],
  },
  {
    id: "city-lights-poster",
    name: "City Lights Poster",
    price: 2600,
    shortDescription: "都会の光をテーマにしたポスター。",
    description:
      "ネオンと反射光を重ねたグラフィックポスター。部屋の雰囲気を引き締めます。",
    tags: ["ポスター", "A2"],
    images: [
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1425321395722-b1dd54a97cf3?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1486308510493-aa64833637b9?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "サイズ", value: "A2 (420×594mm)" },
      { label: "用紙", value: "グロス紙" },
      { label: "発送", value: "3-5営業日以内" },
      { label: "備考", value: "フレームは別売り" },
    ],
  },
  {
    id: "botanical-studies",
    name: "Botanical Studies",
    price: 5400,
    shortDescription: "植物図譜のようなカラー作品集。",
    description:
      "繊細な線画と彩色を重ねた作品集。全48ページのフルカラー。",
    tags: ["作品集", "48P", "フルカラー"],
    images: [
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "ページ", value: "48ページ" },
      { label: "サイズ", value: "A4" },
      { label: "製本", value: "無線綴じ" },
      { label: "発送", value: "5-7営業日以内" },
    ],
  },
  {
    id: "silent-horizon",
    name: "Silent Horizon",
    price: 3900,
    shortDescription: "水平線の静けさを描いたキャンバスプリント。",
    description:
      "淡い光と空の余韻を捉えたキャンバスプリント。壁面を柔らかく彩ります。",
    tags: ["キャンバス", "限定", "軽量"],
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1434144893279-2a9fc14e9337?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "サイズ", value: "F4 (333×242mm)" },
      { label: "素材", value: "キャンバス布" },
      { label: "付属", value: "壁掛け金具" },
      { label: "発送", value: "5-7営業日以内" },
    ],
  },
  {
    id: "luminous-stories",
    name: "Luminous Stories",
    price: 2800,
    shortDescription: "短編4編を収録した小説集。",
    description:
      "光と記憶をテーマにした短編4編を収録。限定書き下ろしの表紙アート付き。",
    tags: ["小説", "4編", "限定表紙"],
    images: [
      "https://images.unsplash.com/photo-1507842217343-583f20270319?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1457694587812-e8bf29a43845?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&h=900&fit=crop",
    ],
    specs: [
      { label: "ページ", value: "96ページ" },
      { label: "サイズ", value: "文庫" },
      { label: "形式", value: "ソフトカバー" },
      { label: "発送", value: "2-4営業日以内" },
    ],
  },
];
