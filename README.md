# 座標表示アプリ

位置情報を様々な形式で表示するWebアプリケーションです。GoogleMapを使います。APIキーを用意してください。

## 機能

- **左側パネル**: 位置情報を表示
- **右側マップ**: GoogleMapを表示
- **APIキー管理**: LocalStorageにAPIキーを安全に保存
- **設定の永続化**: パネル幅、マップ位置・ズームレベルの保存
- **インテリジェント検索**: Places API (New)を使用したオートコンプリート機能
- **住所情報**: 逆ジオコーディングによる住所・郵便番号取得
- **多様な座標形式**: WGS84および日本測地系（Tokyo97）の緯度経度、度分秒、ミリ秒形式
- **URL生成**: Google Maps、OpenStreetMapへの直接リンク
- **ログ機能**: 操作履歴とエラー情報の表示

## 使用方法

1. **APIキーの設定**
   - Google Cloud ConsoleでGoogle Maps APIキーを取得
   - アプリの左側パネルにAPIキーを入力
   - 「保存」ボタンをクリックしてLocalStorageに保存
   - APIキーを保存するとマップを読み込みます

2. **場所の検索**
   - 検索で位置を選択

3. **位置情報の取得**
   - マップ上をクリックして位置を選択

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
- Google APIキーでこれらを有効化してください
  - Maps JavaScript API
  - Geocoding API
  - Places API (New)

### 対応測地系
- WGS84（世界測地系）- GPS等で使用される国際標準
- Tokyo97（日本測地系）- 日本国内の測量で使用される座標系

### データ保存
- LocalStorage - APIキー、UI設定、マップ状態の永続化

## 注意事項

- Google APIキーでこれらを有効化してください
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
