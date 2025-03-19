let map;
let locationMarkers = [];
let cameraMarkers = [];

// Google Mapsの初期化（APIのcallbackとして実行）
function initMap() {
  const centerPosition = { lat: 20.0, lng: 0.0 }; // 世界全体表示用の中心座標
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: centerPosition,
    mapTypeId: 'roadmap'
  });
  // 初回データ読み込みはapp.js側で呼び出し
}

// 位置情報マーカー追加
function addLocationMarker(position, infoContent) {
  const marker = new google.maps.Marker({
    position: position,
    map: map
  });
  if (infoContent) {
    const infowindow = new google.maps.InfoWindow({
      content: infoContent
    });
    marker.addListener('click', () => {
      infowindow.open(map, marker);
    });
  }
  locationMarkers.push(marker);
}

// カメラ用マーカー追加（カメラアイコン使用）
function addCameraMarker(position, infoContent) {
  const marker = new google.maps.Marker({
    position: position,
    map: map,
    icon: {
      url: '/images/camera-icon.png', // カメラアイコン画像（適宜用意）
      scaledSize: new google.maps.Size(32, 32)
    }
  });
  if (infoContent) {
    const infowindow = new google.maps.InfoWindow({
      content: infoContent
    });
    marker.addListener('click', () => {
      infowindow.open(map, marker);
    });
  }
  cameraMarkers.push(marker);
}

// 既存の位置情報マーカー削除
function clearLocationMarkers() {
  locationMarkers.forEach(marker => marker.setMap(null));
  locationMarkers = [];
}

// 既存のカメラマーカー削除
function clearCameraMarkers() {
  cameraMarkers.forEach(marker => marker.setMap(null));
  cameraMarkers = [];
}
