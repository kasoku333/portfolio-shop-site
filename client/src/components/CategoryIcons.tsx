import type { SVGProps } from "react";

// トップの入口に使う記号。
// 地図記号のように要素を絞り、明朝体にならって「縦は太く、横は細く、
// 横線の右端に小さな山（うろこ）」という強弱を付けて、硬くなりすぎないようにしている。
// 色は currentColor なので、使う側の文字色がそのまま乗る。
const THICK = 5.5;
const THIN = 2;

const base = {
  viewBox: "0 0 96 96",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// 漫画：斜めに割ったコマ。
// まっすぐ十字に割ると漢字の「円」に見えたので、漫画らしく斜めの割り方にしている。
export function MangaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 19 L24 78" strokeWidth={THICK} />
      <path d="M72 19 L72 78" strokeWidth={THICK} />
      <path d="M24 19 L72 19 M24 77 L72 77" strokeWidth={THIN} />
      <path d="M24 54 L72 40" strokeWidth={2.6} />
      <path d="M43 49 L40 77" strokeWidth={4} />
    </svg>
  );
}

// イラスト：筆と、ひと筆の払い。
// 穂先は細い葉の形にし、下の線は明朝体の「払い」のように太さを変えている。
export function IllustrationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M77 13 L58 37" strokeWidth={5} />
      <path d="M55 41 L51 46" strokeWidth={THIN} />
      <path
        d="M49 47 Q54 53 47 61 Q40 68 30 71 Q32 60 38 53 Q43 47 49 47 Z"
        fill="currentColor"
        strokeWidth={1}
      />
      <path
        d="M17 80 Q24 79 30 81 Q52 88 80 76 Q54 92 28 87 Q20 85 17 80 Z"
        fill="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}

// 小説：開いた本。背だけ太く、ページの線は細く。
// 縦書きの行（縦線3本）も試したが、「川」や「!」に見えたので本にした。
export function NovelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M48 27 L48 78" strokeWidth={THICK} />
      <path d="M48 27 Q33 18 17 24 L17 72 Q33 67 48 78" strokeWidth={2.8} />
      <path d="M48 27 Q63 18 79 24 L79 72 Q63 67 48 78" strokeWidth={2.8} />
    </svg>
  );
}
