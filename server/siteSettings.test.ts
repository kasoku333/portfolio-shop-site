import { describe, expect, it } from "vitest";
import { sortByArtworkOrder } from "./siteSettings";

const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
const ids = (list: { id: number }[]) => list.map((item) => item.id);

describe("sortByArtworkOrder", () => {
  it("指定が空なら元の順のまま", () => {
    expect(ids(sortByArtworkOrder(items, []))).toEqual([1, 2, 3, 4]);
  });

  it("指定した順に並ぶ", () => {
    expect(ids(sortByArtworkOrder(items, [3, 1, 4, 2]))).toEqual([3, 1, 4, 2]);
  });

  it("指定に無い作品（後から追加した作品）は、元の順で後ろに続く", () => {
    expect(ids(sortByArtworkOrder(items, [4, 2]))).toEqual([4, 2, 1, 3]);
  });

  it("削除済みの作品IDが指定に残っていても無視される", () => {
    expect(ids(sortByArtworkOrder(items, [99, 2, 1]))).toEqual([2, 1, 3, 4]);
  });
});
