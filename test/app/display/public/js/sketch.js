let videoGrid = []; // 動画を管理する配列
let rows = 3; // 縦に並べる動画の数
let cols = 3; // 横に並べる動画の数
let videoSize = 200; // 動画のサイズ（500x500）
let maxVideos = rows * cols; // 表示できる最大の動画数
let isUserInteracted = false; // ユーザーがインタラクトしたかどうか

function fetchVideoList() {
    fetch('/videos') // サーバーから動画リストを取得
        .then(response => response.json())
        .then(videoFiles => {
            // 動画を更新
            videoGrid = [];
            videoFiles.slice(0, maxVideos).forEach(file => {
                let vid = createVideo(`/videos/${file}`);
                vid.size(videoSize, videoSize);
                vid.loop();
                vid.hide();
                videoGrid.push(vid);
            });
        })
        .catch(err => console.error('動画リストの取得エラー:', err));
}

function setup() {
    createCanvas(videoSize * cols, videoSize * rows);

    // 初回の動画リスト取得
    fetchVideoList();

    // 動的更新 (10秒ごとに動画リストを更新)
    setInterval(fetchVideoList, 10000);
}

function draw() {
    // 動画をグリッド状に描画
    for (let i = 0; i < videoGrid.length; i++) {
        let col = i % cols;
        let row = Math.floor(i / cols);
        let x = col * videoSize;
        let y = row * videoSize;
        image(videoGrid[i], x, y, videoSize, videoSize);
    }
}

function mousePressed() {
    if (!isUserInteracted) {
        // ユーザーが初めてクリックしたときに動画を再生する
        videoGrid.forEach(vid => vid.loop());
        isUserInteracted = true;
    }
}