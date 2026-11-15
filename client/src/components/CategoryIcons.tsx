import type { SVGProps } from "react";

// トップの入口に使う手描き風のアイコン。
// 線をわざと少し歪ませ、顔を付けて「ゆるい」印象にしている。
// 塗りは不透明な淡い色なので、ライト・ダークどちらの背景でも同じ見え方になる。
const LINE = "oklch(0.36 0.03 55)";
const PAPER = "oklch(0.985 0.012 85)";
const CHEEK = "oklch(0.86 0.08 20)";

const base = {
  viewBox: "0 0 96 96",
  fill: "none",
  stroke: LINE,
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// 漫画：コマ割りした1ページ。下のコマに顔。
export function MangaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 22 Q47 17 76 21 Q79 48 77 76 Q48 80 21 77 Q17 50 20 22 Z" fill={PAPER} />
      <path d="M21 46 Q48 43 77 45" />
      <path d="M50 20 Q49 33 51 44" />
      <path d="M27 30 L41 28" />
      <path d="M27 37 L36 36" />
      <path
        d="M64 25 L66 31 L72 33 L66 35 L64 41 L62 35 L56 33 L62 31 Z"
        fill="oklch(0.9 0.12 90)"
        strokeWidth={2.4}
      />
      <circle cx="35" cy="66" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="62" cy="66" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="41" cy="60" r="2.2" fill={LINE} stroke="none" />
      <circle cx="56" cy="60" r="2.2" fill={LINE} stroke="none" />
      <path d="M44.5 65 Q48.5 69 52.5 65" />
    </svg>
  );
}

// イラスト：絵の具をのせたパレットと筆。
export function IllustrationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M48 16 C68 14 84 28 82 46 C81 58 72 60 64 58 C57 56 54 62 57 68 C60 76 54 82 44 81 C26 79 13 65 14 46 C15 29 29 17 48 16 Z"
        fill={PAPER}
      />
      <circle cx="29" cy="37" r="5.5" fill="oklch(0.78 0.13 25)" strokeWidth={2.4} />
      <circle cx="47" cy="28" r="5.5" fill="oklch(0.82 0.09 220)" strokeWidth={2.4} />
      <circle cx="65" cy="35" r="5.5" fill="oklch(0.9 0.12 90)" strokeWidth={2.4} />
      <circle cx="24" cy="62" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="46" cy="62" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="29" cy="56" r="2.2" fill={LINE} stroke="none" />
      <circle cx="41" cy="56" r="2.2" fill={LINE} stroke="none" />
      <path d="M32 61 Q35 64.5 38 61" />
      <path d="M72 72 L88 87" strokeWidth={4.5} />
      <path d="M64 63 Q72 64 74 72 Q69 75 64 72 Q61 68 64 63 Z" fill="oklch(0.78 0.13 25)" strokeWidth={2.4} />
    </svg>
  );
}

// 小説：しおりを挟んだ本と、木陰の葉っぱ。
export function NovelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M24 20 Q48 16 68 19 Q71 48 69 78 Q46 82 25 79 Q21 50 24 20 Z"
        fill="oklch(0.9 0.06 150)"
      />
      <path d="M33 19 Q31 50 34 79" />
      <path d="M54 18 L54 35 L59.5 30 L65 35 L65 19" fill="oklch(0.78 0.13 25)" strokeWidth={2.4} />
      <circle cx="41" cy="60" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="62" cy="60" r="3.2" fill={CHEEK} stroke="none" />
      <circle cx="45" cy="54" r="2.2" fill={LINE} stroke="none" />
      <circle cx="58" cy="54" r="2.2" fill={LINE} stroke="none" />
      <path d="M48.5 59 Q51.5 62.5 54.5 59" />
      <path d="M75 68 Q78 54 90 50 Q90 64 75 68 Z" fill="oklch(0.85 0.1 140)" strokeWidth={2.4} />
      <path d="M77 66 L85 56" strokeWidth={2} />
    </svg>
  );
}
