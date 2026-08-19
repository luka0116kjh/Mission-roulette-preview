import { MISSIONS } from "../data/missions";
import type { Theme } from "../utils/storage";
import { todayKey } from "../utils/storage";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: Props) {
  const isDark = theme === "dark";

  return (
    <header className="header">
      <div className="header__top">
        <p className="header__eyebrow">미션 룰렛</p>
        <button
          type="button"
          className="theme-toggle"
          aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          onClick={onToggleTheme}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.7 15.2A8.5 8.5 0 0 1 8.8 3.3a8.9 8.9 0 1 0 11.9 11.9Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4.2" />
              <path
                d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <h1 className="header__title">
        오늘 뭐라도
        <br />
        하나 해볼까요?
      </h1>
      <p className="header__sub">카테고리를 고르고 버튼을 누르면 미션이 정해져요.</p>
      <p className="header__meta">
        {todayKey()} · 미션 {MISSIONS.length}개
      </p>
    </header>
  );
}
