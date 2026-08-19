import { useState } from "react";
import { categoryMeta, RARITY_META, type Mission } from "../types/mission";

interface Props {
  mission: Mission;
  isFavorite: boolean;
  onComplete: () => void;
  onReroll: () => void;
  onToggleFavorite: () => void;
}

const DIFFICULTY_TEXT = ["", "아주 쉬움", "쉬움", "보통", "어려움", "아주 어려움"];
const COPY_RESET_MS = 1500;

function shareText(mission: Mission): string {
  return mission.description ? `${mission.title}\n${mission.description}` : mission.title;
}

/** navigator.clipboard가 없는 환경(비보안 컨텍스트 등)에서도 동작하는 대체 복사 */
function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export default function MissionCard({
  mission,
  isFavorite,
  onComplete,
  onReroll,
  onToggleFavorite,
}: Props) {
  const category = categoryMeta(mission.category);
  const rarity = RARITY_META[mission.rarity];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = shareText(mission);
    let ok = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = legacyCopy(text);
      }
    } else {
      ok = legacyCopy(text);
    }

    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_RESET_MS);
  };

  return (
    <>
      <article className="panel">
        <div className="panel__tags">
          <div className="panel__tags-left">
            <span className={`badge badge--${mission.rarity}`}>{rarity.label}</span>
            <span className="badge badge--plain">{category.label}</span>
          </div>

          <div className="panel__tools">
            <button
              type="button"
              className={`iconbtn${isFavorite ? " iconbtn--on" : ""}`}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기에 추가"}
              onClick={onToggleFavorite}
            >
              <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path
                  d="M12 4.5c1.6-2.4 6.4-2.6 8 .8 1.5 3.1-1.1 6.4-8 11.7-6.9-5.3-9.5-8.6-8-11.7 1.6-3.4 6.4-3.2 8-.8Z"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="iconbtn"
              aria-label="미션 복사하기"
              onClick={handleCopy}
            >
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M4 12.5l5.2 5.2L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="8" y="8" width="12" height="12" rx="2.5" />
                  <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4H6.5A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
                </svg>
              )}
            </button>
          </div>
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

        {copied && <p className="panel__toast" role="status">복사했어요</p>}
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
