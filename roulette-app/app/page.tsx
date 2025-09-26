"use client";

import { useState, useMemo } from "react";
import styles from "./Roulette.module.css";

// 候補者の型定義
interface Contestant {
  name: string;
  weight: number;
}

export default function RoulettePage() {
  // 候補者リストの状態管理
  const [contestants, setContestants] = useState<Contestant[]>([
    { name: "等々力", weight: 1 },
    { name: "西島", weight: 1 },
    { name: "西沢", weight: 1 },
    { name: "山口", weight: 1 },
    { name: "田村", weight: 1 },
    { name: "田沼", weight: 1 },
    { name: "関戸", weight: 1 },
    { name: "古池", weight: 1 },
    { name: "近藤", weight: 1 },
    { name: "土橋", weight: 1 },
    { name: "池田", weight: 1 },
    { name: "横山", weight: 1 },
  ]);
  // いかさまの対象者を管理 (-1は無効)
  const [cheatTargetIndex, setCheatTargetIndex] = useState<number>(1);
  // 回転角度の状態管理
  const [rotation, setRotation] = useState(0);
  // 回転中の状態管理
  const [isSpinning, setIsSpinning] = useState(false);
  // 当選者の状態管理
  const [winner, setWinner] = useState<Contestant | null>(null);

  // ルーレットの各セクションの色を計算
  const colors = [
    "#FFDDC1",
    "#FFABAB",
    "#FFC3A0",
    "#FF677D",
    "#D4A5A5",
    "#392F5A",
    "#A5678E",
    "#F3A683",
    "#B1D4E0",
    "#145DA0",
  ];
  const totalWeight = useMemo(
    () => contestants.reduce((sum, c) => sum + c.weight, 0),
    [contestants]
  );

  const conicGradient = useMemo(() => {
    let gradientString = "conic-gradient(";
    let currentAngle = 0;
    contestants.forEach((c, index) => {
      if (c.weight <= 0) return;
      const percentage = (c.weight / totalWeight) * 100;
      const startAngle = currentAngle;
      const endAngle = currentAngle + percentage * 3.6; // 1% = 3.6deg
      gradientString += `${
        colors[index % colors.length]
      } ${startAngle}deg ${endAngle}deg, `;
      currentAngle = endAngle;
    });
    return gradientString.slice(0, -2) + ")";
  }, [contestants, totalWeight]);

  // 候補者の名前を追加する関数
  const addContestant = () => {
    setContestants([
      ...contestants,
      { name: `候補者${contestants.length + 1}`, weight: 1 },
    ]);
  };

  // 候補者の情報を更新する関数
  const updateContestant = (
    index: number,
    field: keyof Contestant,
    value: string | number
  ) => {
    const newContestants = [...contestants];
    if (field === "name") {
      newContestants[index].name = String(value);
    } else if (field === "weight") {
      const weightValue = Number(value);
      newContestants[index].weight = weightValue > 0 ? weightValue : 0;
    }
    setContestants(newContestants);
  };

  // 候補者を削除する関数
  const removeContestant = (index: number) => {
    setContestants(contestants.filter((_, i) => i !== index));
    if (cheatTargetIndex === index) {
      setCheatTargetIndex(-1);
    }
  };

  // ルーレットを回す関数
  const handleSpin = () => {
    if (isSpinning || contestants.length === 0 || totalWeight <= 0) return;

    setIsSpinning(true);
    setWinner(null);

    let winnerIndex: number;

    // いかさま機能が有効な場合
    if (cheatTargetIndex !== -1 && contestants[cheatTargetIndex]) {
      winnerIndex = cheatTargetIndex;
    } else {
      // 通常の重み付き抽選
      const random = Math.random() * totalWeight;
      let weightSum = 0;
      winnerIndex = contestants.findIndex((c) => {
        weightSum += c.weight;
        return random < weightSum;
      });
      if (winnerIndex === -1) winnerIndex = contestants.length - 1;
    }

    // 1. 当選セクションの角度範囲を計算
    let cumulativeWeight = 0;
    for (let i = 0; i < winnerIndex; i++) {
      cumulativeWeight += contestants[i].weight;
    }
    const winnerStartAngle = (cumulativeWeight / totalWeight) * 360;
    const winnerSectionAngle =
      (contestants[winnerIndex].weight / totalWeight) * 360;

    // 2. 当選セクション内のランダムな停止位置を決定
    const randomOffsetRatio = 0.1 + Math.random() * 0.8; // 0.1 ~ 0.9
    const stopOffsetAngle = winnerSectionAngle * randomOffsetRatio;
    const targetAngle = winnerStartAngle + stopOffsetAngle;

    // 3. 矢印(真上=270deg)が targetAngle に来るように、ホイールが回転すべき角度を計算
    const baseRotation = 270 - targetAngle;

    // 4. 現在の回転量から、1周未満の端数をリセット
    const currentAngle = rotation % 360;

    // 5. 複数周回分の回転を追加し、最終的な回転量を決定
    const spinCount = 10;
    const finalRotation =
      rotation - currentAngle + 360 * spinCount + baseRotation;

    setRotation(finalRotation);

    // アニメーション終了後に当選者を確定
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(contestants[winnerIndex]);
    }, 5000); // CSSのtransition時間と合わせる
  };
  const enableSetting = false;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>フットサル幹事決定ルーレット</h1>

      <div className={styles.mainContent}>
        {enableSetting && (
          <div className={styles.settings}>
            <h2>設定</h2>
            {contestants.map((c, index) => (
              <div key={index} className={styles.inputGroup}>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) =>
                    updateContestant(index, "name", e.target.value)
                  }
                  placeholder="名前"
                  className={styles.input}
                />
                <input
                  type="number"
                  value={c.weight}
                  onChange={(e) =>
                    updateContestant(index, "weight", e.target.value)
                  }
                  placeholder="割合"
                  min="0"
                  step="0.1"
                  className={styles.inputWeight}
                />
                <label className={styles.cheatLabel}>
                  <input
                    type="radio"
                    name="cheat"
                    checked={cheatTargetIndex === index}
                    onChange={() => setCheatTargetIndex(index)}
                    title="この人を必ず当選させる"
                  />
                  🎯
                </label>
                <button
                  onClick={() => removeContestant(index)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addContestant} className={styles.addButton}>
              候補者を追加
            </button>
            {contestants.length > 0 && (
              <button
                onClick={() => setCheatTargetIndex(-1)}
                disabled={cheatTargetIndex === -1}
                className={styles.clearCheatButton}
              >
                いかさまを解除
              </button>
            )}
          </div>
        )}

        <div className={styles.rouletteArea}>
          <div className={styles.pointer}>▼</div>
          <div
            className={styles.wheel}
            style={{
              background: conicGradient,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {contestants.map((c, index) => {
              if (c.weight <= 0) return null;
              const cumulativeWeight = contestants
                .slice(0, index)
                .reduce((sum, current) => sum + current.weight, 0);
              const startAngle = (cumulativeWeight / totalWeight) * 360;
              const angle = startAngle + ((c.weight / totalWeight) * 360) / 2;
              const radius = 100;

              // ★★★ ここが修正点です ★★★
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);

              return (
                <div
                  key={index}
                  className={styles.label}
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
                  }}
                >
                  {c.name}
                </div>
              );
            })}
          </div>
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={styles.spinButton}
          >
            {isSpinning ? "回転中..." : "回す！"}
          </button>
          {winner && (
            <div className={styles.result}>
              🎉 幹事は「{winner.name}」さんです！ 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
