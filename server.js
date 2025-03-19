require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Node v18以降では fetch がグローバルに使えます。
// 古いバージョンの場合は node-fetch の導入を検討してください。

// キャッシュ用変数（10秒キャッシュ）
let locationCache = { data: null, timestamp: 0 };
let cameraCache = { data: null, timestamp: 0 };
const CACHE_DURATION = 10000; // ミリ秒

// 静的ファイル（publicフォルダ）の配信
app.use(express.static(path.join(__dirname, 'public')));

// APIプロキシ：OpenCellid
app.get('/api/locations', async (req, res) => {
  const now = Date.now();
  if (locationCache.data && (now - locationCache.timestamp < CACHE_DURATION)) {
    return res.json(locationCache.data);
  }
  const opencellidApiKey = process.env.OPENCELLID_API_KEY;
  if (!opencellidApiKey) {
    return res.status(500).json({ error: "OPENCELLID_API_KEY not set" });
  }
  // ※下記URLは例。実際のエンドポイント・パラメータに合わせて変更してください。
  const url = `https://api.opencellid.org/v1/locations?api_key=${opencellidApiKey}&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // ※レスポンスから必要な情報（例：{ locations: [...] }）を抽出・整形
    locationCache = { data, timestamp: now };
    res.json(data);
  } catch (error) {
    console.error("OpenCellid API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// APIプロキシ：inscam（カメラ情報）
app.get('/api/cameras', async (req, res) => {
  const now = Date.now();
  if (cameraCache.data && (now - cameraCache.timestamp < CACHE_DURATION)) {
    return res.json(cameraCache.data);
  }
  const inscamApiKey = process.env.INSCAM_API_KEY;
  if (!inscamApiKey) {
    return res.status(500).json({ error: "INSCAM_API_KEY not set" });
  }
  // ※下記URLは例。実際のエンドポイント・パラメータに合わせて変更してください。
  const url = `https://api.inscam.orn/v1/cameras?api_key=${inscamApiKey}&format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // ※必要に応じてデータ整形（例：{ cameras: [...] }）
    cameraCache = { data, timestamp: now };
    res.json(data);
  } catch (error) {
    console.error("Inscam API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ルートにアクセスがあった場合、index.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
