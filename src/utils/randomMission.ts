import { MISSIONS } from "../data/missions";
import {
  RARITY_META,
  type Mission,
  type Rarity,
  type SelectableCategory,
} from "../types/mission";

const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

/** 선택된 카테고리의 미션 목록 */
export function missionsOf(category: SelectableCategory): Mission[] {
  return category === "all"
    ? MISSIONS
    : MISSIONS.filter((m) => m.category === category);
}

/**
 * 희귀도를 먼저 뽑는다.
 * 풀에 존재하지 않는 희귀도는 후보에서 빼고 가중치를 다시 정규화한다.
 */
function pickRarity(pool: Mission[]): Rarity {
  const available = RARITY_ORDER.filter((r) => pool.some((m) => m.rarity === r));
  const total = available.reduce((sum, r) => sum + RARITY_META[r].weight, 0);
  let roll = Math.random() * total;

  for (const rarity of available) {
    roll -= RARITY_META[rarity].weight;
    if (roll <= 0) return rarity;
  }
  return available[available.length - 1];
}

function sample<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 카테고리 안에서 미션 하나를 뽑는다.
 * excludeId(직전 미션)는 제외하되, 그 결과 후보가 없어지면 제외를 포기한다.
 */
export function pickMission(
  category: SelectableCategory,
  excludeId: number | null,
): Mission {
  const base = missionsOf(category);
  const pool =
    excludeId === null || base.length <= 1
      ? base
      : base.filter((m) => m.id !== excludeId);

  const target = pool.length > 0 ? pool : base;
  const rarity = pickRarity(target);
  return sample(target.filter((m) => m.rarity === rarity));
}

/**
 * 룰렛이 돌아가는 동안 지나갈 미션 목록.
 * 마지막 칸은 반드시 실제 결과 미션이다.
 */
export function buildReel(
  category: SelectableCategory,
  result: Mission,
  length = 16,
): Mission[] {
  const base = missionsOf(category);
  const reel: Mission[] = [];

  for (let i = 0; i < length - 1; i += 1) {
    const prev = reel[i - 1];
    let next = sample(base);
    if (base.length > 1) {
      while (prev && next.id === prev.id) next = sample(base);
    }
    reel.push(next);
  }

  reel.push(result);
  return reel;
}
