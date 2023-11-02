let version = `
last modified: 2023/06/01 01:34:31
`
var results;
function setup() {
    let p5canvas = createCanvas(400, 400);
    p5canvas.parent('#canvas');

    // お手々が見つかると以下の関数が呼び出される．resultsに検出結果が入っている．
    gotDetections = function (_results) {
        results = _results;
        strokeWeight(5)
        let video_width = document.querySelector('#webcam').videoWidth;
        let video_height = document.querySelector('#webcam').videoHeight;
        // 取得したboundingBoxの値を現在のcanvas描画とあわせる前処理
        for (let d of results.detections) {
            let bb = d.boundingBox;
            let ratio = {
                x: width / video_width,
                y: height / video_height
            }
            bb.originX = ratio.x * bb.originX;
            bb.originY = ratio.y * bb.originY;
            bb.width *= ratio.x;
            bb.height *= ratio.y;
        }
        adjustCanvas();

    }

    document.querySelector('#version').innerHTML = version;
}

function draw() {

    clear();
    if (results) {

        for (let detection of results.detections) {
            let index = detection.categories[0].index;
            let bb = detection.boundingBox;
            let name = detection.categories[0].categoryName;
            let score = detection.categories[0].score;
            let c = getColorByIndex(index);
            c = [...c, 250];
            stroke(c);
            strokeWeight(2);
            noFill();
            rect(
                bb.originX, bb.originY,
                bb.width, bb.height
            )
            fill(c);
            rect(
                bb.originX, bb.originY - 20,
                bb.width, 20
            )

            noStroke();
            fill(255);
            textSize(20);
            textAlign(LEFT, CENTER);
            text(`${name} - ${score.toFixed(2)} `, bb.originX + 10, bb.originY - 10);
            index++;
        }
    }
    noFill();
    noStroke();
    rect(0, 0, 640, 480);

    stroke(250);
}
function getColorByIndex(index) {
    const colors = [
        [221, 160, 221], // プラム
        [240, 128, 128], // ライトコーラル
        [173, 216, 230], // ライトブルー
        [144, 238, 144], // ライトグリーン
        [220, 220, 220], // グレイ
        [244, 164, 96],  // ライトサーモン
        [192, 192, 192], // シルバー
        [255, 222, 173], // ナバホホワイト
        [175, 238, 238], // パオダーターコイズ
        [255, 228, 196], // ビスク
        [250, 128, 114], // サーモン
        [152, 251, 152], // パレグリーン
        [176, 224, 230], // パウダーブルー
        [255, 218, 185], // ピーチパフ
        [240, 230, 140], // カーキ
        [240, 128, 128], // ライトコーラル
        [144, 238, 144], // ライトグリーン
        [192, 192, 192], // シルバー
        [255, 228, 196], // ビスク
        [250, 128, 114]  // サーモン
    ];

    if (index < 0) {
        index = 0;
    }

    index = index % colors.length;

    return colors[index];
}


function adjustCanvas() {
    // Get an element by its ID
    var element_webcam = document.getElementById('webcam');
    resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
    //console.log(element_webcam.clientWidth);
}

function share() {
    let element = document.getElementById('render');
    html2canvas(element).then(canvas => {
        canvas.toBlob(function (blob) {
            let file = new File([blob], "image.png", {
                type: "image/png",
            });
            const filesArray = [file];

            if (navigator.share) {
                navigator.share({
                    // title: 'Hiddenmickey',
                    // text: '#hiddenmickey',
                    files: filesArray
                })
                    .then(() => console.log('Share was successful.'))
                    .catch((error) => console.log('Sharing failed', error));
            } else {
                alert(`Your system doesn't support sharing files.`);
            }
        });
    });
}

function toggleCameraPlay() {
    let element_video = document.querySelector('#webcam');
    if (element_video.paused) {
        element_video.play();
    } else {
        element_video.pause();
    }

}