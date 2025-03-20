// 前回取得したデータを保持（比較用）
let prevLocationsJSON = '';
let prevCamerasJSON = '';

// APIエンドポイントから位置情報データを取得
async function fetchLocationData() {
  try {
    const response = await fetch('/api/locations');
    const data = await response.json();
    // ※データ形式に合わせて必要な加工を行う（例：data.locations）
    return data.locations || data;
  } catch (error) {
    console.error('位置情報取得エラー:', error);
    return [];
  }
}

// APIエンドポイントからカメラ情報を取得
async function fetchCameraData() {
  try {
    const response = await fetch('/api/cameras');
    const data = await response.json();
    // ※データ形式に合わせて必要な加工を行う（例：data.cameras）
    return data.cameras || data;
  } catch (error) {
    console.error('カメラ情報取得エラー:', error);
    return [];
  }
}

// マップとカメラパネルの更新（差分更新）
async function fetchDataAndUpdateMap() {
  try {
    // 並列で取得
    const [locationData, cameraData] = await Promise.all([
      fetchLocationData(),
      fetchCameraData()
    ]);

    const currentLocationsJSON = JSON.stringify(locationData);
    const currentCamerasJSON = JSON.stringify(cameraData);

    // 前回と差分があれば更新（不要な再描画を防止）
    if (currentLocationsJSON !== prevLocationsJSON) {
      clearLocationMarkers();
      locationData.forEach(item => {
        // item は { lat, lng, info } と仮定
        addLocationMarker({ lat: item.lat, lng: item.lng }, item.info);
      });
      prevLocationsJSON = currentLocationsJSON;
    }

    if (currentCamerasJSON !== prevCamerasJSON) {
      clearCameraMarkers();
      updateCameraPanel(cameraData);
      cameraData.forEach(camera => {
        // camera は { lat, lng, name, stream } と仮定
        addCameraMarker(
          { lat: camera.lat, lng: camera.lng },
          `<strong>${camera.name}</strong><br>ストリームURL: ${camera.stream}`
        );
      });
      prevCamerasJSON = currentCamerasJSON;
    }
  } catch (error) {
    console.error('データ更新エラー:', error);
  } finally {
    // 更新完了後、30秒後に次回更新（setTimeout で重複防止）
    setTimeout(fetchDataAndUpdateMap, 30000);
  }
}

// カメラパネルの更新（minitokyo3d風デザイン例）
function updateCameraPanel(cameraData) {
  const panel = document.getElementById('camera-panel');
  // タイトルは維持するため、最初の子要素以外をクリア
  while (panel.childElementCount > 1) {
    panel.removeChild(panel.lastChild);
  }
  cameraData.forEach(camera => {
    const item = document.createElement('div');
    item.className = 'camera-item';
    item.innerHTML = `<strong>${camera.name}</strong><br>位置: (${camera.lat.toFixed(2)}, ${camera.lng.toFixed(2)})`;
    // クリックで別ウィンドウでストリーム再生（実装例）
    item.addEventListener('click', () => {
      window.open(camera.stream, '_blank');
    });
    panel.appendChild(item);
  });
}

// 初回更新は、Google Map の初期化完了後に呼び出す
window.addEventListener('load', () => {
  // initMap() は Google Maps API のcallbackで実行されるため、ここではタイミングに注意
  // すでに map オブジェクトが存在する場合のみデータ更新開始
  if (typeof map !== 'undefined') {
    fetchDataAndUpdateMap();
  } else {
    // 初回読み込み時に initMap の完了を待つため、定期チェック
    const checkInterval = setInterval(() => {
      if (typeof map !== 'undefined') {
        clearInterval(checkInterval);
        fetchDataAndUpdateMap();
      }
    }, 500);
  }
});
