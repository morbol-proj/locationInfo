// グローバル変数
let map;
let geocoder;
let apiKey = null;

// DOM要素の取得
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const deleteApiKeyBtn = document.getElementById('delete-api-key');
const mapContainer = document.getElementById('map');

// 検索フォーム要素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const moveToMarkerButton = document.getElementById('move-to-marker-button');

// 位置情報表示要素
const postalCodeSpan = document.getElementById('postal-code');
const addressSpan = document.getElementById('address');

// 座標形式表示要素
const wgs84DmsSpan = document.getElementById('wgs84-dms');
const wgs84DecimalSpan = document.getElementById('wgs84-decimal');
const wgs84MillisecondsSpan = document.getElementById('wgs84-milliseconds');
const tokyo97DmsSpan = document.getElementById('tokyo97-dms');
const tokyo97DecimalSpan = document.getElementById('tokyo97-decimal');
const tokyo97MillisecondsSpan = document.getElementById('tokyo97-milliseconds');
const googleMapsUrlLink = document.getElementById('google-maps-url');
const osmUrlLink = document.getElementById('osm-url');

// ログ関連要素
const logContainer = document.getElementById('log-container');
const clearLogBtn = document.getElementById('clear-log');

// 初期化
document.addEventListener('DOMContentLoaded', function () {
    addLog('アプリケーションを初期化しました', 'info');
    loadSettings(); // 設定を復元
    loadApiKey();
    setupEventListeners();
    setupResizeHandle();
});

// イベントリスナーの設定
function setupEventListeners() {
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    deleteApiKeyBtn.addEventListener('click', deleteApiKey);
    clearLogBtn.addEventListener('click', clearLog);

    // 検索フォームのイベントリスナー
    searchButton.addEventListener('click', handleSearchAction);
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            // オートコンプリートが処理する場合があるため、ここでは何もしない
            // キーダウンイベントで処理される
        }
    });

    // マーカー移動ボタンのイベントリスナー
    moveToMarkerButton.addEventListener('click', moveToMarker);

    // Ctrl+F キーボードショートカットで検索フォームをフォーカス
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault(); // ブラウザのデフォルト検索を無効化
            searchInput.focus();
            searchInput.select(); // テキストを選択状態にする
        }
    });

}

// ログ出力関数
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${message}`;

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ログクリア関数
function clearLog() {
    logContainer.innerHTML = '';
    addLog('ログをクリアしました', 'info');
}

// APIキーの保存
function saveApiKey() {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('googleMapsApiKey', key);
        apiKey = key;
        addLog('APIキーが保存されました', 'success');
        // マップの読み込み
        loadMap();
    } else {
        addLog('APIキーを入力してください', 'warning');
    }
}

// APIキーの削除
function deleteApiKey() {
    if (confirm('保存されているAPIキーを削除しますか？\nこの操作は取り消せません。')) {
        localStorage.removeItem('googleMapsApiKey');
        apiKey = null;
        apiKeyInput.value = '';
        addLog('APIキーが削除されました', 'info');

        // マップをクリア
        if (map) {
            map = null;
            geocoder = null;
            window.currentMarker = null;
            const mapContainer = document.getElementById('map');
            mapContainer.innerHTML = '';

            // オートコンプリートコンテナも削除
            const autocompleteContainer = document.querySelector('.autocomplete-container');
            if (autocompleteContainer) {
                autocompleteContainer.remove();
            }

            // マーカー移動ボタンを無効化
            if (moveToMarkerButton) {
                moveToMarkerButton.disabled = true;
            }
        }
    }
}

// APIキーの読み込み
function loadApiKey() {
    const savedKey = localStorage.getItem('googleMapsApiKey');
    if (savedKey) {
        apiKeyInput.value = savedKey;
        apiKey = savedKey;
        // 保存されたAPIキーがある場合は自動的にマップを読み込む
        loadMap();
    } else {
        addLog('APIキーを入力してください', 'warning');
    }
}

// 設定をローカルストレージに保存
function saveSettings() {
    const settings = {
        panelWidth: document.querySelector('.info-panel').style.width || '400px',
        mapZoom: map ? map.getZoom() : 10,
        mapCenter: map ? {
            lat: map.getCenter().lat(),
            lng: map.getCenter().lng()
        } : { lat: 35.6762, lng: 139.6503 }
    };

    localStorage.setItem('mapSettings', JSON.stringify(settings));
    // addLog('設定を保存しました', 'info');
}

// 設定をローカルストレージから復元
function loadSettings() {
    const savedSettings = localStorage.getItem('mapSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);

            // パネル幅の復元
            if (settings.panelWidth) {
                const infoPanel = document.querySelector('.info-panel');
                infoPanel.style.width = settings.panelWidth;
            }

            return settings;
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
            return null;
        }
    }
    return null;
}

// マップの読み込み
function loadMap() {
    const key = apiKeyInput.value.trim();
    if (!key) {
        addLog('APIキーを入力してください', 'warning');
        return;
    }

    // APIキーを保存
    localStorage.setItem('googleMapsApiKey', key);
    apiKey = key;

    // スクリプトタグを動的に更新
    const script = document.querySelector('script[src*="maps.googleapis.com"]');
    if (script) {
        script.remove();
    }

    const newScript = document.createElement('script');
    newScript.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry&callback=initMap&v=weekly`;
    newScript.async = true;
    newScript.defer = true;
    newScript.onerror = function () {
        addLog('Google Maps APIの読み込みに失敗しました。APIキーを確認してください。', 'error');
    };
    document.head.appendChild(newScript);
    addLog('Google Maps APIを読み込み中...', 'info');
}

// Google Maps APIの初期化
function initMap() {
    addLog('Google Maps APIの読み込みが完了しました', 'success');

    // 保存された設定を取得
    const savedSettings = JSON.parse(localStorage.getItem('mapSettings') || 'null');
    const defaultLocation = savedSettings && savedSettings.mapCenter
        ? savedSettings.mapCenter
        : { lat: 35.6762, lng: 139.6503 };
    const defaultZoom = savedSettings && savedSettings.mapZoom
        ? savedSettings.mapZoom
        : 10;

    map = new google.maps.Map(mapContainer, {
        zoom: defaultZoom,
        center: defaultLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    geocoder = new google.maps.Geocoder();

    // Autocompleteの初期化（Places API Newに対応）
    initializeAutocomplete();

    // 地図の変更イベントリスナーを追加
    map.addListener('zoom_changed', function () {
        setTimeout(saveSettings, 1000); // 遅延して保存（連続イベントを防ぐ）
    });

    map.addListener('center_changed', function () {
        setTimeout(saveSettings, 1000); // 遅延して保存（連続イベントを防ぐ）
    });

    // マップクリックイベント
    map.addListener('click', function (event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateLocationInfo(lat, lng);
        addMarker(lat, lng);
    });

    // 初期位置情報の表示
    updateLocationInfo(defaultLocation.lat, defaultLocation.lng);
    addMarker(defaultLocation.lat, defaultLocation.lng);
}


// Places API (New)のText Searchを実行
async function textSearchNew(query) {
    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    const requestBody = {
        textQuery: query,
        maxResultCount: 10
    };

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Places API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.places || [];
    } catch (error) {
        console.error('Text Search error:', error);
        throw error;
    }
}

// Places API (New)のAutocomplete機能（Autocomplete (New)）
async function autocompleteNew(input, sessionToken = null) {
    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    const requestBody = {
        input: input
    };

    // セッショントークンがある場合は追加
    if (sessionToken) {
        requestBody.sessionToken = sessionToken;
    }

    // 位置バイアスを設定（マップが初期化されている場合）
    if (map) {
        requestBody.locationBias = {
            circle: {
                center: {
                    latitude: map.getCenter().lat(),
                    longitude: map.getCenter().lng()
                },
                radius: 50000.0 // 50km
            }
        };
    }

    // 日本に限定
    requestBody.includedRegionCodes = ['JP'];

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Places API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.suggestions || [];
    } catch (error) {
        console.error('Autocomplete error:', error);
        throw error;
    }
}

// Places API (New)のAutocompleteの初期化（カスタム実装）
function initializeAutocomplete() {
    let autocompleteTimeout;
    let currentSessionToken = generateSessionToken();
    let selectedIndex = -1;
    let suggestions = [];

    // オートコンプリートの結果を表示するコンテナを作成
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-container';
    autocompleteContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    `;

    // 検索入力フィールドの親要素に相対位置を設定
    const searchContainer = searchInput.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(autocompleteContainer);

    // 入力イベントリスナー
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();

        if (query.length < 1) {
            hideAutocomplete();
            return;
        }

        // 前回のタイムアウトをクリア
        clearTimeout(autocompleteTimeout);

        // デバウンス処理（300ms待機）
        autocompleteTimeout = setTimeout(async () => {
            try {
                const results = await autocompleteNew(query, currentSessionToken);
                showAutocompleteSuggestions(results);
            } catch (error) {
                console.error('Autocomplete error:', error);
                hideAutocomplete();
            }
        }, 300);
    });

    // キーボードナビゲーション
    searchInput.addEventListener('keydown', function (e) {
        const items = autocompleteContainer.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < items.length) {
                // 選択された候補を使用
                selectSuggestion(suggestions[selectedIndex]);
            } else {
                // 候補がない場合は通常の検索を実行
                performSearch();
            }
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });

    // 外部をクリックでオートコンプリートを非表示
    document.addEventListener('click', function (e) {
        if (!searchContainer.contains(e.target)) {
            hideAutocomplete();
        }
    });

    function showAutocompleteSuggestions(results) {
        suggestions = results;
        selectedIndex = -1;
        autocompleteContainer.innerHTML = '';

        if (results.length === 0) {
            hideAutocomplete();
            return;
        }

        results.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.style.cssText = `
                padding: 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background-color 0.2s;
            `;

            // 予測結果のテキストを取得
            const prediction = suggestion.placePrediction;
            if (prediction) {
                const mainText = prediction.text?.text || '';

                item.innerHTML = `
                    <div style="font-weight: 500; color: #333;">${mainText}</div>
                `;
            }

            item.addEventListener('click', () => selectSuggestion(suggestion));
            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                updateSelection(autocompleteContainer.querySelectorAll('.autocomplete-item'));
            });

            autocompleteContainer.appendChild(item);
        });

        autocompleteContainer.style.display = 'block';
    }

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.backgroundColor = '#f0f0f0';
            } else {
                item.style.backgroundColor = 'white';
            }
        });
    }

    async function selectSuggestion(suggestion) {
        const prediction = suggestion.placePrediction;
        if (!prediction || !prediction.placeId) {
            addLog('選択した場所の情報が不完全です', 'warning');
            return;
        }

        try {
            // Place Detailsを取得
            const placeDetails = await getPlaceDetails(prediction.placeId);

            if (placeDetails && placeDetails.location) {
                const lat = placeDetails.location.latitude;
                const lng = placeDetails.location.longitude;

                // 検索入力フィールドを更新
                searchInput.value = prediction.text?.text || '';

                // マップを移動
                updateMapCenter({ lat: lat, lng: lng });

                addLog(`場所を選択しました: ${placeDetails.displayName?.text || prediction.text?.text}`, 'success');

                // 新しいセッショントークンを生成
                currentSessionToken = generateSessionToken();
            } else {
                addLog('選択した場所の位置情報が取得できませんでした', 'warning');
            }
        } catch (error) {
            console.error('Place details error:', error);
            addLog('場所の詳細情報の取得に失敗しました', 'error');
        }

        hideAutocomplete();
    }

    function hideAutocomplete() {
        autocompleteContainer.style.display = 'none';
        selectedIndex = -1;
    }
}

// Places API (New)でPlace Detailsを取得
async function getPlaceDetails(placeId) {
    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    try {
        const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,rating,userRatingCount'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Places API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Place details error:', error);
        throw error;
    }
}

// セッショントークンを生成
function generateSessionToken() {
    return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// マーカーの追加
function addMarker(lat, lng) {
    // 既存のマーカーを削除
    if (window.currentMarker) {
        window.currentMarker.setMap(null);
    }

    window.currentMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: `緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`
    });

    // マーカーが設置されたら移動ボタンを有効化
    if (moveToMarkerButton) {
        moveToMarkerButton.disabled = false;
    }
}

// マーカーの位置に地図を移動する関数
function moveToMarker() {
    if (!window.currentMarker) {
        addLog('マーカーが設置されていません', 'warning');
        return;
    }

    if (!map) {
        addLog('地図が初期化されていません', 'error');
        return;
    }

    const markerPosition = window.currentMarker.getPosition();
    if (markerPosition) {
        map.setCenter(markerPosition);
    } else {
        addLog('マーカーの位置を取得できませんでした', 'error');
    }
}

// 位置情報の更新
async function updateLocationInfo(lat, lng) {
    // WGS84（世界測地系）座標形式
    const wgs84Dms = convertToDMS(lat, lng);
    wgs84DmsSpan.textContent = wgs84Dms;
    wgs84DecimalSpan.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    wgs84MillisecondsSpan.textContent = convertToMilliseconds(lat, lng);

    // Tokyo97（日本測地系）座標形式
    const tokyo97 = convertWGS84ToTokyo97(lat, lng);
    const tokyo97Dms = convertToDMS(tokyo97.lat, tokyo97.lng);
    tokyo97DmsSpan.textContent = tokyo97Dms;
    tokyo97DecimalSpan.textContent = `${tokyo97.lat.toFixed(6)}, ${tokyo97.lng.toFixed(6)}`;
    tokyo97MillisecondsSpan.textContent = convertToMilliseconds(tokyo97.lat, tokyo97.lng);

    // URLの更新
    updateUrls(lat, lng);

    // 逆ジオコーディングで住所を取得
    try {
        const addressData = await reverseGeocode(lat, lng);
        updateAddressInfo(addressData);
    } catch (error) {
        console.error('住所の取得に失敗しました:', error);
        postalCodeSpan.textContent = '取得できませんでした';
        addressSpan.textContent = '取得できませんでした';
    }

}

// 逆ジオコーディング
function reverseGeocode(lat, lng) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const result = results[0];
                const addressComponents = result.address_components;

                // 住所情報を抽出
                const addressData = {
                    formatted_address: result.formatted_address,
                    country: '',
                    postal_code: '',
                    address: ''
                };

                // 国と郵便番号を抽出
                addressComponents.forEach(component => {
                    const types = component.types;

                    if (types.includes('country')) {
                        addressData.country = component.long_name;
                    } else if (types.includes('postal_code')) {
                        addressData.postal_code = component.long_name;
                    }
                });

                // formatted_addressから国と郵便番号を削除して住所を取得
                let tempAddress = addressData.formatted_address;

                // 日本の都道府県リスト
                const prefectures = [
                    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
                    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
                    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
                    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
                    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
                    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
                    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
                ];

                // 都道府県が含まれている位置を検索
                let prefectureIndex = -1;
                let foundPrefecture = '';

                for (const prefecture of prefectures) {
                    const index = tempAddress.indexOf(prefecture);
                    if (index !== -1) {
                        prefectureIndex = index;
                        foundPrefecture = prefecture;
                        break;
                    }
                }

                // 都道府県が見つかった場合、その位置から後方を住所として取得
                if (prefectureIndex !== -1) {
                    addressData.address = tempAddress.substring(prefectureIndex);
                } else {
                    // 都道府県が見つからない場合はそのまま出力
                    addressData.address = tempAddress;
                }

                // ハイフンを全角マイナスに置換
                if (addressData.address) {
                    addressData.address = addressData.address.replace(/−/g, '－');
                }

                resolve(addressData);
            } else {
                reject(new Error('住所を取得できませんでした'));
            }
        });
    });
}

// 住所情報の更新
function updateAddressInfo(addressData) {
    postalCodeSpan.textContent = addressData.postal_code || '-';
    addressSpan.textContent = addressData.address || '-';
}

// 度分秒形式への変換
function convertToDMS(lat, lng) {
    const latDMS = convertDecimalToDMS(lat, 'lat');
    const lngDMS = convertDecimalToDMS(lng, 'lng');
    return `${latDMS}, ${lngDMS}`;
}

function convertDecimalToDMS(decimal, type) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;

    const direction = type === 'lat'
        ? (decimal >= 0 ? 'N' : 'S')
        : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
}

// ミリ秒形式への変換
function convertToMilliseconds(lat, lng) {
    const latMs = Math.round(lat * 3600000);
    const lngMs = Math.round(lng * 3600000);
    return `${latMs}, ${lngMs}`;
}

// WGS84から日本測地系への変換（ユーザー提供の計算式）
function convertWGS84ToTokyo97(wgs84Lat, wgs84Lng) {
    // ユーザー提供の計算式:
    // 日本測地系の緯度 = 世界測地系の緯度 + 0.00010696 * 世界測地系の緯度 - 0.000017467 * 世界測地系の経度 - 0.004602
    // 日本測地系の経度 = 世界測地系の経度 + 0.000046047 * 世界測地系の緯度 + 0.000083049 * 世界測地系の経度 - 0.010041
    
    const jgdLat = wgs84Lat + (0.00010696 * wgs84Lat) - (0.000017467 * wgs84Lng) - 0.004602;
    const jgdLng = wgs84Lng + (0.000046047 * wgs84Lat) + (0.000083049 * wgs84Lng) - 0.010041;

    return { lat: jgdLat, lng: jgdLng };
}


// 検索アクションを処理（ボタンクリック時）
function handleSearchAction() {
    // オートコンプリートが表示されているかチェック
    const autocompleteContainer = document.querySelector('.autocomplete-container');
    if (autocompleteContainer && autocompleteContainer.style.display !== 'none') {
        const suggestionItems = autocompleteContainer.querySelectorAll('.autocomplete-item');
        if (suggestionItems.length > 0) {
            // オートコンプリートの最上段候補をクリック
            suggestionItems[0].click();
            return;
        }
    }

    // 通常の検索を実行
    performSearch();
}

// URLの更新
function updateUrls(lat, lng) {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;

    googleMapsUrlLink.href = googleMapsUrl;
    googleMapsUrlLink.textContent = 'Google Mapsで開く';

    osmUrlLink.href = osmUrl;
    osmUrlLink.textContent = 'OpenStreetMapで開く';
}

// Places API (New) を使用した検索機能の実装
async function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        addLog('検索キーワードを入力してください', 'warning');
        return;
    }

    if (!apiKey) {
        addLog('Google Maps APIキーが設定されていません', 'error');
        return;
    }

    // 検索状態を設定
    searchButton.disabled = true;
    searchButton.textContent = '検索中...';

    addLog(`"${query}" を検索しています...`, 'info');

    try {
        // Places API (New)のText Searchを実行
        const results = await textSearchNew(query);

        // 検索完了後にボタンの状態を復元
        searchButton.disabled = false;
        searchButton.textContent = '検索';

        if (results && results.length > 0) {
            // 最初の結果を使用してマップを移動
            const firstResult = results[0];
            if (firstResult.location) {
                const lat = firstResult.location.latitude;
                const lng = firstResult.location.longitude;
                updateMapCenter({ lat: lat, lng: lng });

                const placeName = firstResult.displayName?.text || firstResult.formattedAddress || 'Unknown place';
                addLog(`検索結果: ${placeName} に移動しました`, 'success');

            } else {
                addLog('検索結果の位置情報が取得できませんでした', 'warning');
            }
        } else {
            addLog('該当する場所が見つかりませんでした', 'warning');
        }

    } catch (error) {
        // エラーが発生した場合でもボタンの状態を復元   
        searchButton.disabled = false;
        searchButton.textContent = '検索';

        console.error('Search error:', error);

        // エラーメッセージの詳細化
        if (error.message.includes('401')) {
            addLog('APIキーが無効です。正しいAPIキーを設定してください。', 'error');
        } else if (error.message.includes('403')) {
            addLog('Places API (New)が有効になっていません。Google Cloud Consoleで有効にしてください。', 'error');
        } else if (error.message.includes('429')) {
            addLog('検索クエリの制限に達しました。しばらく待ってから再試行してください。', 'warning');
        } else if (error.message.includes('400')) {
            addLog('無効な検索リクエストです。検索キーワードを確認してください。', 'error');
        } else {
            addLog(`検索処理でエラーが発生しました: ${error.message}`, 'error');
        }
    }
}



// マップの中心位置を更新
function updateMapCenter(position) {
    if (map) {
        map.setCenter(position);

        // 既存のマーカーを削除
        if (window.currentMarker) {
            window.currentMarker.setMap(null);
        }

        // 新しいマーカーを追加
        window.currentMarker = new google.maps.Marker({
            position: position,
            map: map,
            title: '検索結果'
        });

        // 位置情報を更新
        updateLocationInfo(position.lat, position.lng);
        addLog(`地図を移動しました: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`, 'success');
    }
}



// リサイズハンドルの設定
function setupResizeHandle() {
    const resizeHandle = document.querySelector('.resize-handle');
    const infoPanel = document.querySelector('.info-panel');

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizeHandle.addEventListener('mousedown', function (e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = parseInt(window.getComputedStyle(infoPanel).width, 10);

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);

        e.preventDefault();
    });

    function handleResize(e) {
        if (!isResizing) return;

        const newWidth = startWidth + (e.clientX - startX);
        const minWidth = 300;
        const maxWidth = 600;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            infoPanel.style.width = newWidth + 'px';
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        // リサイズ終了時に設定を保存
        saveSettings();
    }
}

// Google Maps APIの認証エラーハンドリング
window.gm_authFailure = function () {
    addLog('Google Maps APIの認証に失敗しました。APIキーを確認してください。', 'error');
};