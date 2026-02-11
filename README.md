# 学級ルーレット（React + TypeScript + Tailwind）

授業中に発表者を公平に選ぶためのホイール型ルーレットです。  
非復元抽選（当選者を次回除外）と、見た目だけ変化するTwist演出を実装しています。

## 主な機能

- 生徒管理（追加 / 削除 / 名称編集 / 一括編集）
- 抽選対象のON/OFF（`isAvailable`切り替え）
- 非復元抽選（当選者は自動で対象外）
- 全員リセット
- Twist演出（鳥 / 風 / きらめき、確率・クールダウン設定）
- セグメント表示設定（solid / striped / outlined）
- ラベル設定（full / initial / number）
- LocalStorage永続化

## セットアップ

```bash
npm install
npm run dev
```

## 検証コマンド

```bash
npm run lint
npm run build
```

## 永続化キー

- `class-roulette:students:v1`
- `class-roulette:settings:v1`
