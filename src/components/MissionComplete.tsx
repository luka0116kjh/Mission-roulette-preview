import type { Mission, StatsData } from "../types/mission";

interface Props {
  mission: Mission;
  stats: StatsData;
  onNext: () => void;
}

export default function MissionComplete({ mission, stats, onNext }: Props) {
  return (
    <>
      <article className="panel panel--done">
        <span className="check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M4 12.5l5.2 5.2L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h2 className="panel__title">오늘도 하나 해냈어요</h2>
        <p className="panel__desc">{mission.title}</p>

        <p className="done__line">
          오늘 완료한 미션 <strong>{stats.todayCompleted}개</strong>
          {stats.streak > 1 && <> · 연속 {stats.streak}일째</>}
        </p>
      </article>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onNext}>
          새 미션 뽑기
        </button>
      </div>
    </>
  );
}
