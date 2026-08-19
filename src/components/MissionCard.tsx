import { categoryMeta, RARITY_META, type Mission } from "../types/mission";

interface Props {
  mission: Mission;
  onComplete: () => void;
  onReroll: () => void;
}

const DIFFICULTY_TEXT = ["", "아주 쉬움", "쉬움", "보통", "어려움", "아주 어려움"];

export default function MissionCard({ mission, onComplete, onReroll }: Props) {
  const category = categoryMeta(mission.category);
  const rarity = RARITY_META[mission.rarity];

  return (
    <>
      <article className="panel">
        <div className="panel__tags">
          <span className={`badge badge--${mission.rarity}`}>{rarity.label}</span>
          <span className="badge badge--plain">{category.label}</span>
        </div>

        <h2 className="panel__title">{mission.title}</h2>
        {mission.description && <p className="panel__desc">{mission.description}</p>}

        <div className="meter">
          <div className="meter__head">
            <span>난이도</span>
            <strong>{DIFFICULTY_TEXT[mission.difficulty]}</strong>
          </div>
          <div
            className="meter__track"
            role="img"
            aria-label={`난이도 5단계 중 ${mission.difficulty}단계`}
          >
            <span style={{ width: `${(mission.difficulty / 5) * 100}%` }} />
          </div>
        </div>
      </article>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onComplete}>
          완료했어요
        </button>
        <button type="button" className="btn btn--sub" onClick={onReroll}>
          다시 뽑기
        </button>
      </div>
    </>
  );
}
