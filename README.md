# 位置情報マップ - GoogleMap位置情報表示アプリ

GoogleMapを使ってクリックしたポイントの位置情報を様々な形式で表示するWebアプリケーションです。

## 機能

- **左側パネル**: 位置情報を詳細に表示
- **右側マップ**: GoogleMapで位置を視覚的に確認
- **APIキー管理**: LocalStorageにAPIキーを安全に保存
- **インテリジェント検索**: Places API (New)を使用したオートコンプリート機能
- **多様な座標形式**: WGS84および日本測地系（Tokyo97）の緯度経度、度分秒、ミリ秒形式
- **住所情報**: 逆ジオコーディングによる住所・郵便番号取得
- **URL生成**: Google Maps、OpenStreetMapへの直接リンク
- **リサイザブルUI**: パネル幅の調整が可能
- **ログ機能**: 操作履歴とエラー情報の表示
- **設定の永続化**: パネル幅、マップ位置・ズームレベルの保存

## 使用方法

1. **APIキーの設定**
   - Google Cloud ConsoleでGoogle Maps APIキーを取得
   - Places API (New)を有効にしてください
   - アプリの左側パネルにAPIキーを入力
   - 「保存」ボタンをクリックしてLocalStorageに保存
   - APIキーが保存されると自動的にマップが読み込まれます

2. **場所の検索**
   - 検索フォームに住所やキーワードを入力
   - オートコンプリート候補から選択するか、「検索」ボタンをクリック
   - キーボードの矢印キーで候補を選択、Enterで決定可能

3. **位置情報の取得**
   - マップ上をクリックして位置を選択
   - 左側パネルに詳細な位置情報が表示されます
   - 「マーカーの位置に移動」ボタンでマーカーに地図を移動

## 表示される情報

### 基本情報
- 郵便番号
- 住所（日本の都道府県以降を表示）

### 座標形式
- **世界測地系（WGS84）**
  - 度分秒（DMS）形式
  - 度（10進数）形式
  - ミリ秒形式
- **日本測地系（Tokyo97）**
  - 度分秒（DMS）形式
  - 度（10進数）形式
  - ミリ秒形式

### URL・リンク
- Google Maps URL
- OpenStreetMap URL

## ファイル構成

```
locationInfo/
├── index.html      # メインHTMLファイル
├── styles.css      # スタイルシート
├── script.js       # JavaScript機能
└── README.md       # このファイル
```

## 技術仕様

### 使用API
- Google Maps JavaScript API
- Google Places API (New) - オートコンプリート・検索機能用
- Google Geocoding API - 住所取得用

### 対応測地系
- WGS84（世界測地系）- GPS等で使用される国際標準
- Tokyo97（日本測地系）- 日本国内の測量で使用される座標系

### データ保存
- LocalStorage - APIキー、UI設定、マップ状態の永続化

## 注意事項

- **Google Maps APIキーが必要です**
  - Maps JavaScript API
  - Geocoding API
  - Places API (New)

## セキュリティ

- APIキーはLocalStorageに保存されます
- APIキーはブラウザ内でのみ使用され、外部に送信されません
- 「削除」ボタンでAPIキーを安全に削除できます

## 対応ブラウザ

- Chrome（推奨）
- Firefox
- Safari
- Edge

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
