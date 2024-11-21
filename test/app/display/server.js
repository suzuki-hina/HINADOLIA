const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 動画フォルダのパス
const VIDEO_FOLDER = path.join(__dirname, 'videos');

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(VIDEO_FOLDER));  // videos フォルダの静的ファイル提供

// 動画リストを取得するエンドポイント
app.get('/videos', (req, res) => {
    fs.readdir(VIDEO_FOLDER, (err, files) => {
        if (err) {
            console.error('動画フォルダの読み込みエラー:', err);
            res.status(500).send('動画フォルダを読み込めませんでした。');
            return;
        }

        // MP4ファイルのみフィルタリング
        const videoFiles = files
            .filter(file => file.endsWith('.mp4'))
            .sort((a, b) => {
                // ファイル名の日時に基づいてソート (新しい順)
                const timeA = parseInt(a.replace('.mp4', '').replace(/-/g, ''));
                const timeB = parseInt(b.replace('.mp4', '').replace(/-/g, ''));
                return timeB - timeA;
            });

        res.json(videoFiles);
    });
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
