import { categoryMeta, type Mission } from "../types/mission";

interface Props {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
  onRemove: (id: number) => void;
}

export default function Favorites({ missions, onSelect, onRemove }: Props) {
  if (missions.length === 0) return null;

  return (
    <section className="favorites">
      <h2 className="section-title">즐겨찾기</h2>
      <ul className="favorites__list">
        {missions.map((mission) => {
          const category = categoryMeta(mission.category);
          return (
            <li key={mission.id} className="favorites__item">
              <button
                type="button"
                className="favorites__pick"
                onClick={() => onSelect(mission)}
              >
                <span className="favorites__cat">{category.label}</span>
                <span className="favorites__title">{mission.title}</span>
              </button>
              <button
                type="button"
                className="favorites__remove"
                aria-label={`${mission.title} 즐겨찾기에서 삭제`}
                onClick={() => onRemove(mission.id)}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
