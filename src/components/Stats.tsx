import type { StatsData } from "../types/mission";

interface Props {
  stats: StatsData;
  onReset: () => void;
}

export default function Stats({ stats, onReset }: Props) {
  const empty = stats.totalCompleted === 0;

  return (
    <section className="stats">
      <h2 className="section-title">내 기록</h2>

      <dl className="stats__list">
        <div className="stats__row">
          <dt>오늘 완료</dt>
          <dd>{stats.todayCompleted}개</dd>
        </div>
        <div className="stats__row">
          <dt>전체 완료</dt>
          <dd>{stats.totalCompleted}개</dd>
        </div>
        <div className="stats__row">
          <dt>연속 성공</dt>
          <dd>{stats.streak}일</dd>
        </div>
      </dl>

      <p className="stats__foot">
        {empty ? (
          "첫 미션을 완료하면 기록이 쌓여요."
        ) : (
          <>
            <span>최고 연속 {stats.bestStreak}일</span>
            <button type="button" className="linkbtn" onClick={onReset}>
              기록 초기화
            </button>
          </>
        )}
      </p>
    </section>
  );
}
