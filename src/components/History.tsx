import { categoryMeta, type HistoryEntry } from "../types/mission";

interface Props {
  entries: HistoryEntry[];
}

/** 화면에는 최근 것만 보여준다. 저장은 더 많이 하되(storage.ts의 HISTORY_LIMIT) 목록은 짧게. */
const VISIBLE_LIMIT = 8;

export default function History({ entries }: Props) {
  if (entries.length === 0) return null;

  const visible = entries.slice(0, VISIBLE_LIMIT);

  return (
    <section className="history">
      <h2 className="section-title">최근 완료</h2>
      <ul className="history__list">
        {visible.map((entry, i) => {
          const category = categoryMeta(entry.category);
          return (
            <li key={`${entry.id}-${entry.completedAt}-${i}`} className="history__item">
              <span className="history__cat">{category.label}</span>
              <span className="history__title">{entry.title}</span>
              <span className="history__date">{entry.date}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
