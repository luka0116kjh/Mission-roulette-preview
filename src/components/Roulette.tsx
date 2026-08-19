import { useLayoutEffect, useRef } from "react";
import { categoryMeta, type Mission } from "../types/mission";

export const REEL_ITEM_HEIGHT = 76;

interface Props {
  items: Mission[];
  /** 감속에 걸리는 시간(ms) */
  duration: number;
  /** 값이 바뀔 때마다 릴을 처음부터 다시 돌린다 */
  spinKey: number;
}

export default function Roulette({ items, duration, spinKey }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip || items.length === 0) return;

    // 트랜지션 없이 맨 위로 되돌린 뒤, 강제 리플로우로 시작점을 확정한다.
    strip.style.transition = "none";
    strip.style.transform = "translate3d(0, 0, 0)";
    void strip.offsetHeight;

    const travel = (items.length - 1) * REEL_ITEM_HEIGHT;
    strip.style.transition = `transform ${duration}ms cubic-bezier(0.16, 0.84, 0.24, 1)`;
    strip.style.transform = `translate3d(0, ${-travel}px, 0)`;
  }, [items, duration, spinKey]);

  return (
    <div className="reel" aria-hidden="true">
      <div className="reel__focus" />
      <div className="reel__viewport">
        <div className="reel__strip" ref={stripRef}>
          {items.map((mission, index) => (
            <div className="reel__item" key={`${spinKey}-${index}-${mission.id}`}>
              <span className="reel__tag">{categoryMeta(mission.category).label}</span>
              <span className="reel__title">{mission.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
