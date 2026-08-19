import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategorySelector from "./components/CategorySelector";
import Favorites from "./components/Favorites";
import Header from "./components/Header";
import History from "./components/History";
import MissionCard from "./components/MissionCard";
import MissionComplete from "./components/MissionComplete";
import Roulette from "./components/Roulette";
import Stats from "./components/Stats";
import {
  categoryMeta,
  type Mission,
  type SelectableCategory,
  type StatsData,
} from "./types/mission";
import { buildReel, missionById, missionsOf, pickMission } from "./utils/randomMission";
import {
  addHistoryEntry,
  completeMission,
  loadFavorites,
  loadHistory,
  loadStats,
  loadTheme,
  resetStats,
  saveStats,
  saveTheme,
  toggleFavorite,
  type Theme,
} from "./utils/storage";

type Phase = "idle" | "rolling" | "result" | "complete";

const ROLL_MS = 1800;
const ROLL_MS_REDUCED = 350;

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function prefersDarkTheme(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export default function App() {
  const [category, setCategory] = useState<SelectableCategory>("all");
  const [phase, setPhase] = useState<Phase>("idle");
  const [mission, setMission] = useState<Mission | null>(null);
  const [reel, setReel] = useState<Mission[]>([]);
  const [spinKey, setSpinKey] = useState(0);
  const [stats, setStats] = useState<StatsData>(() => loadStats());
  const [history, setHistory] = useState(() => loadHistory());
  const [favorites, setFavorites] = useState<number[]>(() => loadFavorites());
  const [theme, setTheme] = useState<Theme>(() => loadTheme() ?? (prefersDarkTheme() ? "dark" : "light"));

  const lastMissionId = useRef<number | null>(null);
  const timer = useRef<number | null>(null);

  const rollDuration = useMemo(
    () => (prefersReducedMotion() ? ROLL_MS_REDUCED : ROLL_MS),
    [],
  );

  // 날짜가 바뀌어 보정된 기록을 저장소에도 반영한다.
  useEffect(() => {
    saveStats(loadStats());
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const roll = useCallback(() => {
    if (phase === "rolling") return;

    const next = pickMission(category, lastMissionId.current);
    lastMissionId.current = next.id;

    setMission(next);
    setReel(buildReel(category, next));
    setSpinKey((n) => n + 1);
    setPhase("rolling");

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("result"), rollDuration);
  }, [category, phase, rollDuration]);

  const handleCategoryChange = useCallback((next: SelectableCategory) => {
    setCategory(next);
    setPhase("idle");
    setMission(null);
  }, []);

  const handleComplete = useCallback(() => {
    if (!mission) return;
    setStats((prev) => completeMission(prev, mission.category));
    setHistory(addHistoryEntry(mission));
    setPhase("complete");
  }, [mission]);

  const handleReset = useCallback(() => {
    if (!window.confirm("완료 기록을 모두 지울까요? 되돌릴 수 없습니다.")) return;
    setStats(resetStats());
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (!mission) return;
    setFavorites(toggleFavorite(mission.id));
  }, [mission]);

  const handleRemoveFavorite = useCallback((id: number) => {
    setFavorites(toggleFavorite(id));
  }, []);

  const handleSelectFavorite = useCallback((picked: Mission) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    lastMissionId.current = picked.id;
    setMission(picked);
    setPhase("result");
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      saveTheme(next);
      return next;
    });
  }, []);

  const favoriteMissions = useMemo(
    () => favorites.map((id) => missionById(id)).filter((m): m is Mission => !!m),
    [favorites],
  );

  const rolling = phase === "rolling";
  const selected = categoryMeta(category);

  return (
    <div className="app">
      <main className="shell">
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        <CategorySelector value={category} onChange={handleCategoryChange} disabled={rolling} />

        <section className="stage" aria-live="polite">
          {phase === "idle" && (
            <div className="panel panel--empty">
              <p className="empty__title">아직 뽑지 않았어요</p>
              <p className="empty__desc">
                지금 고른 카테고리는 <strong>{selected.label}</strong>, 미션{" "}
                {missionsOf(category).length}개 중에서 하나가 정해져요.
              </p>
            </div>
          )}

          {rolling && <Roulette items={reel} duration={rollDuration} spinKey={spinKey} />}

          {phase === "result" && mission && (
            <MissionCard
              mission={mission}
              isFavorite={favorites.includes(mission.id)}
              onComplete={handleComplete}
              onReroll={roll}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {phase === "complete" && mission && (
            <MissionComplete mission={mission} stats={stats} onNext={roll} />
          )}
        </section>

        {(phase === "idle" || rolling) && (
          <div className="cta">
            <button type="button" className="btn btn--primary" onClick={roll} disabled={rolling}>
              {rolling ? "뽑는 중" : "미션 뽑기"}
            </button>
          </div>
        )}

        <Stats stats={stats} onReset={handleReset} />
        <Favorites
          missions={favoriteMissions}
          onSelect={handleSelectFavorite}
          onRemove={handleRemoveFavorite}
        />
        <History entries={history} />
      </main>
    </div>
  );
}
