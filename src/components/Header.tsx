import { MISSIONS } from "../data/missions";
import { todayKey } from "../utils/storage";

export default function Header() {
  return (
    <header className="header">
      <p className="header__eyebrow">미션 룰렛</p>
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
