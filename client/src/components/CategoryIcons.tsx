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

// 漫画：コマ割り。
export function MangaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M25 20 L25 78" strokeWidth={THICK} />
      <path d="M71 20 L71 78" strokeWidth={THICK} />
      <path d="M52 20 L52 46" strokeWidth={4} />
      <path d="M25 20 L71 20 M25 46 L71 46 M25 75 L71 75" strokeWidth={THIN} />
      <path d="M63 20 L70.5 12.5 L76 21 Z" fill="currentColor" strokeWidth={1} />
    </svg>
  );
}

// イラスト：筆と、ひと筆の線。
export function IllustrationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M75 16 L52 45" strokeWidth={4.5} />
      <path
        d="M45 45 Q55 47 54 56 Q49 68 24 74 Q29 55 45 45 Z"
        fill="currentColor"
        strokeWidth={1}
      />
      <path d="M22 84 Q44 88 70 79" strokeWidth={THIN} />
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
