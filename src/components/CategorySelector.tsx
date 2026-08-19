import { CATEGORIES, type SelectableCategory } from "../types/mission";

interface Props {
  value: SelectableCategory;
  onChange: (value: SelectableCategory) => void;
  disabled?: boolean;
}

export default function CategorySelector({ value, onChange, disabled = false }: Props) {
  return (
    <section className="picker">
      <h2 className="section-title">카테고리</h2>
      <div className="picker__grid" role="radiogroup" aria-label="미션 카테고리">
        {CATEGORIES.map((category) => {
          const selected = category.id === value;
          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`chip${selected ? " chip--on" : ""}`}
              disabled={disabled}
              onClick={() => onChange(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
