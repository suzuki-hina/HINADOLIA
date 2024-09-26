// シーンの状態を表す定数
const STATE_SERECT = 0;
const STATE_MOVE = 1;
const STATE_RECORDING = 2;

// シーンの状態
let state = STATE_SERECT;
let stateMessage;
let stateMessageEn;
let stateMainButtonText;
let buttonIconHTML;
let fileName;

//テクスチャ
let uploadedImage;
let w;
let h;
let W;
let H;
let boxPoint = 12;
let pP = [];
let pT = [];
let pF = [];
let pM = [];

let pB = [];
let pS = [];

let uT = [];
let vT = [];
let uF = [];
let vF = [];

let boxMiddlePos = [];
let middlePointSide = [];
let middlePointParts = [];
let intersectionPoint = [];
let intersectionTexture = [];

//顔の判定
let face_results;

//デバイス判定
let is_pc;

//フォントの変数
let myFont;
let showText = true;

//サンプル画像とフォントの読み込み
function preload() {
  myFont = loadFont('../images/NotoSans.ttf');
  uploadedImage = loadImage('../images/sample.jpg');
}

//録画
P5Capture.setDefaultOptions({
  disableUi: true,
});

function setup() {
  let p5canvas = createCanvas(400, 400, WEBGL);
  p5canvas.parent('#canvas');
  textFont(myFont);
  frameRate(60);

  //機種による処理
  if (navigator.userAgent.indexOf('iPhone') > 0 ||
    navigator.userAgent.indexOf('iPod') > 0 ||
    (navigator.userAgent.indexOf('Android') > 0 &&
      navigator.userAgent.indexOf('Mobile') > 0)) {
    //スマホ用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchEnded(cmouseReleased);
    p5canvas.touchMoved(cmouseDragged);
    is_pc = false;
  } else if (navigator.userAgent.indexOf('iPad') > 0 ||
    navigator.userAgent.indexOf('Android') > 0) {
    //タブレット用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchEnded(cmouseReleased);
    p5canvas.touchMoved(cmouseDragged);
    is_pc = false;
  } else if (navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('Chrome') == -1 &&
    typeof document.ontouchstart !== 'undefined') {
    //iOS13以降のiPad用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchEnded(cmouseReleased);
    p5canvas.touchMoved(cmouseDragged);
    is_pc = false;
  } else {
    p5canvas.mousePressed(cmousePressed);
    p5canvas.mouseReleased(cmouseReleased);
    p5canvas.mouseMoved(cmouseDragged);
    is_pc = true;
  }

  // 顔が見つかると以下の関数が呼び出される．resultsに検出結果が入っている．
  gotFaces = function (_results) {
    face_results = _results;
    strokeWeight(5)
    let video_width = document.querySelector('#webcam').videoWidth;
    let video_height = document.querySelector('#webcam').videoHeight;
    adjustCanvas();
  }
}

function draw() {
  // 描画処理
  clear();  // これを入れないと下レイヤーにあるビデオが見えなくなる
  // console.log("State:" + state);

  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
  if (face_results) {
    // console.log("Face results:", face_results);
    adjustCanvas();

    if (state === STATE_SERECT) {
      scale(-1, 1);
      for (let landmarks of face_results.faceLandmarks) {
        for (let i = 0; i < landmarks.length; i++) {
          fill(255);
          noStroke();
          circle(landmarks[i].x * width - width, landmarks[i].y * height, 2);
        }
      }
    }
    else if (state === STATE_MOVE || state === STATE_RECORDING) {
      animationTexture();
      drawTexture();
    }
  }
}

var element_webcam = document.getElementById('webcam');
var element_canvas = document.getElementById('canvas');
var element_return = document.getElementById('returnButton');
var element_main = document.getElementById('mainButton');

//キャンパスのサイズ調整
function adjustCanvas() {
  if (state === STATE_SERECT) {
    // Get an element by its ID
    w = element_webcam.clientWidth;
    h = element_webcam.clientHeight;
  } else if (state === STATE_MOVE || state === STATE_RECORDING) {
    w = element_webcam.clientWidth;
    h = w * uploadedImage.height / uploadedImage.width;
    W = width;
    H = width * uploadedImage.height / uploadedImage.width;
  }

  resizeCanvas(w, h, WEBGL);
  translate(-width / 2, -height / 2);

  // P5Captureの設定を更新
  P5Capture.setDefaultOptions({
    format: "mp4",
    framerate: 30,
    quality: 0.8,
    width: Math.floor(w / 2) * 2,
    height: Math.floor(h / 2) * 2,
    disableUi: true
  });

}

//ボタンの処理
function stateButton() {
  if (state === STATE_SERECT) {
    element_webcam.style.opacity = '1';
    stateMessage = "カメラの認識ができました。";
    stateMessageEn = "Camera recognition succeeded.";
    stateMainButtonText = "Try HINADOLIA";
    buttonIconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="-4 2 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/> </svg>`;
  } else if (state === STATE_MOVE) {
    element_webcam.style.opacity = '0';
    stateMessage = "顔を動かしてみましょう😄";
    stateMessageEn = "Let's move your face😄";
    stateMainButtonText = "Recording";
    buttonIconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-record-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/></svg>`;
  } else if (state === STATE_RECORDING) {
    stateMessage = "録画中です。";
    stateMessageEn = "Recording...";
    stateMainButtonText = "Stop";
    buttonIconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5z"/></svg>`;
  }
  document.getElementById("mainMessage").innerHTML = stateMessage;
  document.getElementById("mainMessageEn").innerHTML = stateMessageEn;
  document.getElementById("mainButtonText").textContent = stateMainButtonText;
  document.getElementById("buttonIcon").innerHTML = buttonIconHTML;
}

//メインボタンの処理
function mainButtonPressed() {
  const capture = P5Capture.getInstance();
  adjustCanvas();

  if (state == 0) {
    boxSetting();
    textureSetting();
    state++;
    stateButton();
  } else if (state == 1) {
    adjustCanvas();
    if (capture.state === "idle") {
      capture.start();
      console.log("Recording started");
      console.log("width:" + w + "height:" + h);
    }
    state++;
    stateButton();
  } else if (state == 2) {
    if (capture.state !== "idle") {
      capture.stop();
      console.log("Recording stopped");
    }
    state = 1;
    stateButton();
  }
}

//リターンボタンの処理
function returnButtonPressed() {
  if (0 < state && state <= 1) {
    state--;
    stateButton();
  } else if (state == 2) {
    if (capture.state !== "idle") {
      capture.stop();
    }
    state = 0;
    stateButton();
  }
}

//ボックスの初期設定
function boxSetting() {
  w = element_webcam.clientWidth;
  h = w * uploadedImage.height / uploadedImage.width;

  let boxSize_w = w / 5;
  let boxSize_h = h / 5;
  let boxRange_w = w / 20;
  let boxRange_h = h / 20;

  for (let i = 0; i < boxPoint; i++) {
    //ボックスの初期設定
    pB[i] = [];
    pB[i] = new pointBox(pB[i].x, pB[i].y);

    pS[i] = [];
    pS[i] = new pointStrech(pS[i].x, pS[i].y);
  }

  pB[0].x = w * 0.32;
  pB[3].x = w * 0.32;

  pB[1].x = w * 0.385;
  pB[2].x = w * 0.385;

  pB[4].x = w * 0.585;
  pB[7].x = w * 0.585;

  pB[5].x = w * 0.655;
  pB[6].x = w * 0.655;

  pB[8].x = w * 0.385;
  pB[11].x = w * 0.385;

  pB[9].x = w * 0.605;
  pB[10].x = w * 0.605;


  pB[0].y = h * 0.23;
  pB[1].y = h * 0.23;

  pB[2].y = h * 0.295;
  pB[3].y = h * 0.295;

  pB[4].y = h * 0.23;
  pB[5].y = h * 0.23;

  pB[6].y = h * 0.295;
  pB[7].y = h * 0.295;

  pB[8].y = h * 0.5;
  pB[9].y = h * 0.5;

  pB[10].y = h * 0.585;
  pB[11].y = h * 0.585;


  pS[0].x = w * 0.27;
  pS[3].x = w * 0.27;

  pS[1].x = w * 0.435;
  pS[2].x = w * 0.435;

  pS[4].x = w * 0.535;
  pS[7].x = w * 0.535;

  pS[5].x = w * 0.705;
  pS[6].x = w * 0.705;

  pS[8].x = w * 0.325;
  pS[11].x = w * 0.325;

  pS[9].x = w * 0.665;
  pS[10].x = w * 0.665;


  pS[0].y = h * 0.2;
  pS[1].y = h * 0.2;

  pS[2].y = h * 0.315;
  pS[3].y = h * 0.315;

  pS[4].y = h * 0.2;
  pS[5].y = h * 0.2;

  pS[6].y = h * 0.315;
  pS[7].y = h * 0.315;

  pS[8].y = h * 0.45;
  pS[9].y = h * 0.45;

  pS[10].y = h * 0.635;
  pS[11].y = h * 0.635;

}

//テクスチャの座標初期設定
function textureSetting() {
  for (let i = 0; i < boxPoint; i++) {
    pP[i] = [];
    pT[i] = [];
    pF[i] = [];
    middlePointSide[i] = [];

    //ここのおかげでテクスチャの座標が変わらない、多分
    pP[i] = new pointPosition(pB[i].x, pB[i].y);
    pT[i] = new pointTexture(pS[i].x, pS[i].y);
    pF[i] = new pointFix(pB[i].x, pB[i].y);
    pM[i] = new pointMotion(pB[i].x, pB[i].y);
  }

  // console.log("Texture settings initialized");
}

//テクスチャ平面の描画
function drawTexture() {
  noFill();
  noStroke();
  textureMode(NORMAL);
  texture(uploadedImage);

  //uv座標の設定
  for (let i = 0; i < boxPoint; i++) {
    uT[i] = map(pT[i].x, 0, width, 0, 1);
    uF[i] = map(pF[i].x, 0, width, 0, 1);

    // console.log(`uT[${i}] = ${uT[i]}, uF[${i}] = ${uF[i]}`);
  }
  for (let i = 0; i < boxPoint; i++) {
    vT[i] = map(pT[i].y, 0, height, 0, 1);
    vF[i] = map(pF[i].y, 0, height, 0, 1);

    // console.log(`vT[${i}] = ${vT[i]}, vF[${i}] = ${vF[i]}`);
  }

  //テクスチャの描画(全面)
  beginShape();
  vertex(0, 0, 0, 0);
  vertex(w, 0, 1, 0);
  vertex(w, h, 1, 1);
  vertex(0, h, 0, 1);
  endShape(CLOSE);

  // テクスチャの線の描画
  // strokeWeight(2);
  // stroke(255);

  //テクスチャの描画(伸びるところ)
  for (let i = 0; i < boxPoint; i++) {
    if (i < 3 || (3 < i && i < 7) || (7 < i && i < 11)) {
      middlePointSide[i] = new pointMiddle(i, i + 1);
      beginShape(TRIANGLE_STRIP);
      vertex(pT[i].x, pT[i].y, uT[i], vT[i]);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(middlePointSide[i].xT, middlePointSide[i].yT, middlePointSide[i].uT, middlePointSide[i].vT);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      vertex(pT[i + 1].x, pT[i + 1].y, uT[i + 1], vT[i + 1]);
      endShape(CLOSE);
    } else if (i == 3 || i == 7 || i == 11) {
      middlePointSide[i] = new pointMiddle(i, i - 3);
      beginShape(TRIANGLE_STRIP);
      vertex(pT[i].x, pT[i].y, uT[i], vT[i]);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(middlePointSide[i].xT, middlePointSide[i].yT, middlePointSide[i].uT, middlePointSide[i].vT);
      vertex(pP[i - 3].x, pP[i - 3].y, uF[i - 3], vF[i - 3]);
      vertex(pT[i - 3].x, pT[i - 3].y, uT[i - 3], vT[i - 3]);
      endShape(CLOSE);
    }
  }

  //テクスチャの描画(伸びないところ)
  for (let i = 0; i < boxPoint; i++) {
    if (i == 0 || i == 4 || i == 8) {
      intersectionPoint = new intersection(pP[i].x, pP[i].y, pP[i + 2].x, pP[i + 2].y, pP[i + 1].x, pP[i + 1].y, pP[i + 3].x, pP[i + 3].y);
      intersectionTexture = new intersection(uF[i], vF[i], uF[i + 2], vF[i + 2], uF[i + 1], vF[i + 1], uF[i + 3], vF[i + 3]);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(intersectionPoint.x, intersectionPoint.y, intersectionTexture.x, intersectionTexture.y);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      endShape(CLOSE);
    }
    if (i == 1 || i == 5 || i == 9) {
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(intersectionPoint.x, intersectionPoint.y, intersectionTexture.x, intersectionTexture.y);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      endShape(CLOSE);
    } else if (i == 2 || i == 6 || i == 10) {
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(intersectionPoint.x, intersectionPoint.y, intersectionTexture.x, intersectionTexture.y);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      endShape(CLOSE);
    } else if (i == 3 || i == 7 || i == 11) {
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(intersectionPoint.x, intersectionPoint.y, intersectionTexture.x, intersectionTexture.y);
      vertex(pP[i - 3].x, pP[i - 3].y, uF[i - 3], vF[i - 3]);
      endShape(CLOSE);
    }
  }
}

function cmousePressed() {
}

function cmouseReleased() {
}

function cmouseDragged() {
}

//顔を動かす
function animationTexture() {
  for (let i = 0; i < boxPoint; i++) {
    pB[i] = new pointBox(pB[i].x, pB[i].y);
    pS[i] = new pointStrech(pS[i].x, pS[i].y);
  }
  let eyeMax = 0.8;
  let mouthMax = 1;

  // console.log("Starting animationTexture");

  // eyeBlinkLeftとeyeBlinkRightの値を取得してコンソールログに表示
  if (face_results.faceBlendshapes && face_results.faceBlendshapes.length > 0) {
    const blendShapes = face_results.faceBlendshapes[0].categories;

    for (let i = 0; i < blendShapes.length; i++) {
      //目に使う値
      let eyeBlinkLeftScore = blendShapes[9].score.toFixed(3);
      let eyeBlinkRightScore = blendShapes[10].score.toFixed(3);
      let eyeLookDownLeftScore = blendShapes[11].score.toFixed(3);
      let eyeLookDownRightScore = blendShapes[12].score.toFixed(3);
      let eyeLookInLeftScore = blendShapes[13].score.toFixed(3);
      let eyeLookInRightScore = blendShapes[14].score.toFixed(3);
      let eyeLookOutLeftScore = blendShapes[15].score.toFixed(3);
      let eyeLookOutRightScore = blendShapes[16].score.toFixed(3);
      let eyeLookUpLeftScore = blendShapes[17].score.toFixed(3);
      let eyeLookUpRightScore = blendShapes[18].score.toFixed(3);
      let eyeSquintLeftScore = blendShapes[19].score.toFixed(3);
      let eyeSquintRightScore = blendShapes[20].score.toFixed(3);

      //左目のアニメーション
      middlePointParts = new pointMiddle(0, 2);
      if (0 <= i && i <= 3) {
        //左目が左右に動いたときのアニメーション
        let eyeLeftWidthMovement = abs(pF[i].x - pT[i].x);
        if (eyeLookInLeftScore >= eyeLookOutLeftScore) {
          pP[i].x = map(eyeLookInLeftScore, 0, 1, pF[i].x, pF[i].x + eyeLeftWidthMovement);
        }
        else if (eyeLookOutLeftScore > eyeLookInLeftScore) {
          pP[i].x = map(eyeLookOutLeftScore, 0, 1, pF[i].x, pF[i].x - eyeLeftWidthMovement);
        }

        //左目が上下に動いたときのアニメーション
        let eyeLeftHeightMovement = abs(pF[i].y - pT[i].y);
        if (eyeLookUpLeftScore >= eyeLookDownLeftScore) {
          pM[i].y = map(eyeLookUpLeftScore, 0, 1, pF[i].y, pF[i].y - eyeLeftHeightMovement);
        }
        else if (eyeLookDownLeftScore > eyeLookUpLeftScore) {
          pM[i].y = map(eyeLookDownLeftScore, 0, 1, pF[i].y, pF[i].y + eyeLeftHeightMovement);
        }

        // //左目瞬きのアニメーション
        if (eyeBlinkLeftScore >= eyeSquintLeftScore) {
          pP[i].y = map(eyeBlinkLeftScore, 0, eyeMax, pM[i].y, middlePointParts.yM);
        }
        else if (eyeSquintLeftScore > eyeBlinkLeftScore) {
          pP[i].y = map(eyeSquintLeftScore, 0, eyeMax, pM[i].y, middlePointParts.yM);
        }
      }

      //右目のアニメーション
      middlePointParts = new pointMiddle(4, 6);
      if (4 <= i && i <= 7) {
        //右目が左右に動いたときのアニメーション
        let eyeRightWidthMovement = abs(pF[i].x - pT[i].x);
        if (eyeLookInRightScore >= eyeLookOutRightScore) {
          pP[i].x = map(eyeLookInRightScore, 0, 1, pF[i].x, pF[i].x - eyeRightWidthMovement);
        }
        else if (eyeLookOutRightScore > eyeLookInRightScore) {
          pP[i].x = map(eyeLookOutRightScore, 0, 1, pF[i].x, pF[i].x + eyeRightWidthMovement);
        }

        //右目が上下に動いたときのアニメーション
        let eyeRightHeightMovement = abs(pF[i].y - pT[i].y);
        if (eyeLookUpRightScore >= eyeLookDownRightScore) {
          pM[i].y = map(eyeLookUpRightScore, 0, 1, pF[i].y, pF[i].y - eyeRightHeightMovement);
        }
        else if (eyeLookDownRightScore > eyeLookUpRightScore) {
          pM[i].y = map(eyeLookDownRightScore, 0, 1, pF[i].y, pF[i].y + eyeRightHeightMovement);
        }

        //右目瞬きのアニメーション
        if (eyeBlinkRightScore >= eyeSquintRightScore) {
          pP[i].y = map(eyeBlinkRightScore, 0, eyeMax, pM[i].y, middlePointParts.yM);
        }
        else if (eyeSquintRightScore > eyeBlinkRightScore) {
          pP[i].y = map(eyeSquintRightScore, 0, eyeMax, pM[i].y, middlePointParts.yM);
        }
      }

      //口に使う値
      let jawOpenScore = blendShapes[25].score.toFixed(3);
      let mouthFrownLeftScore = blendShapes[30].score.toFixed(3);
      let mouthFrownRightScore = blendShapes[31].score.toFixed(3);
      let mouthLowerDownLeftScore = blendShapes[33].score.toFixed(3);
      let mouthLowerDownRightScore = blendShapes[34].score.toFixed(3);
      let mouthPuckerScore = blendShapes[38].score.toFixed(3);
      let mouthSmileLeftScore = blendShapes[44].score.toFixed(3);
      let mouthSmileRightScore = blendShapes[45].score.toFixed(3);
      let mouthStretchLeftScore = blendShapes[46].score.toFixed(3);
      let mouthStretchRightScore = blendShapes[47].score.toFixed(3);
      let mouthUpperUpLeftScore = blendShapes[48].score.toFixed(3);
      let mouthUpperUpRightScore = blendShapes[49].score.toFixed(3);

      // console.log(jawOpenScore);

      //口のアニメーション
      let mouthWidthMovement = (pT[9].x - pT[8].x) / 6;
      let mouthHeightMovement = (pT[11].y - pT[8].y) / 2;


      if (i == 8) {
        //上唇左の開閉アニメーション
        if (mouthUpperUpLeftScore <= jawOpenScore) {
          pP[i].y = map(jawOpenScore, 0, mouthMax, pT[i].y + mouthHeightMovement, pT[i].y);
        }
        else if (mouthUpperUpLeftScore > jawOpenScore) {
          pP[i].y = map(mouthUpperUpLeftScore, 0, mouthMax, pT[i].y + mouthHeightMovement, pT[i].y);
        }

        //上唇左の横幅アニメーション
        if (mouthStretchLeftScore <= mouthPuckerScore && mouthSmileLeftScore <= mouthPuckerScore) {
          //口が窄まっている時
          pP[i].x = map(mouthPuckerScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x + mouthWidthMovement * 2);
        }
        else {
          //口が横に広がっている時
          if (mouthSmileLeftScore <= mouthStretchLeftScore) {
            pP[i].x = map(mouthStretchLeftScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x);
          }
          else if (mouthSmileLeftScore > mouthStretchLeftScore) {
            pP[i].x = map(mouthSmileLeftScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x);
          }
        }
      }
      else if (i == 9) {
        // //上唇右の開閉アニメーション
        if (mouthUpperUpRightScore <= jawOpenScore) {
          pP[i].y = map(jawOpenScore, 0, mouthMax, pT[i].y + mouthHeightMovement, pT[i].y);
        }
        else if (mouthUpperUpRightScore > jawOpenScore) {
          pP[i].y = map(mouthUpperUpRightScore, 0, mouthMax, pT[i].y + mouthHeightMovement, pT[i].y);
        }

        //上唇右の横幅アニメーション
        if (mouthStretchRightScore <= mouthPuckerScore && mouthSmileRightScore <= mouthPuckerScore) {
          //口が窄まっている時
          pP[i].x = map(mouthPuckerScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x - mouthWidthMovement * 2);
        }
        else {
          //口が横に広がっている時
          if (mouthSmileRightScore <= mouthStretchRightScore) {
            pP[i].x = map(mouthStretchRightScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x);
          }
          else if (mouthSmileRightScore > mouthStretchRightScore) {
            pP[i].x = map(mouthSmileRightScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x);
          }
        }
      }
      else if (i == 11) {
        //下唇左の開閉アニメーション
        if (mouthLowerDownLeftScore <= jawOpenScore) {
          pP[i].y = map(jawOpenScore, 0, mouthMax, pT[i].y - mouthHeightMovement, pT[i].y);
        }
        else if (mouthLowerDownLeftScore > jawOpenScore) {
          pP[i].y = map(mouthLowerDownLeftScore, 0, mouthMax, pT[i].y - mouthHeightMovement, pT[i].y);
        }

        //下唇左の横幅アニメーション
        if (mouthStretchLeftScore <= mouthPuckerScore && mouthFrownLeftScore <= mouthPuckerScore) {
          //口が窄まっている時
          pP[i].x = map(mouthPuckerScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x + mouthWidthMovement * 2);
        }
        else {
          //口が横に広がっている時
          if (mouthFrownLeftScore <= mouthStretchLeftScore) {
            pP[i].x = map(mouthStretchLeftScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x);
          }
          else if (mouthFrownLeftScore > mouthStretchLeftScore) {
            pP[i].x = map(mouthFrownLeftScore, 0, mouthMax, pT[i].x + mouthWidthMovement, pT[i].x);
          }
        }
      }
      else if (i == 10) {
        //下唇右の開閉アニメーション
        if (mouthLowerDownRightScore <= jawOpenScore) {
          pP[i].y = map(jawOpenScore, 0, mouthMax, pT[i].y - mouthHeightMovement, pT[i].y);
        }
        else if (mouthLowerDownRightScore > jawOpenScore) {
          pP[i].y = map(mouthLowerDownRightScore, 0, mouthMax, pT[i].y - mouthHeightMovement, pT[i].y);
        }

        //下唇右の横幅アニメーション
        if (mouthStretchRightScore <= mouthPuckerScore && mouthFrownRightScore <= mouthPuckerScore) {
          //口が窄まっている時
          pP[i].x = map(mouthPuckerScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x - mouthWidthMovement * 2);
        }
        else {
          //口が横に広がっている時
          if (mouthFrownRightScore <= mouthStretchRightScore) {
            pP[i].x = map(mouthStretchRightScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x);
          }
          else if (mouthFrownRightScore > mouthStretchRightScore) {
            pP[i].x = map(mouthFrownRightScore, 0, mouthMax, pT[i].x - mouthWidthMovement, pT[i].x);
          }
        }
      }
    }
  }

  // console.log("Ending animationTexture");
}

class pointPosition {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class pointTexture {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class pointFix {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class pointMotion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class pointBox {
  constructor(x, y) {
    // this.x = x;
    // this.y = y;

    this.x = x * (w / W);
    this.y = y * (h / H);
  }
}

class pointStrech {
  constructor(x, y) {
    // this.x = x;
    // this.y = y;

    this.x = x * (w / W);
    this.y = y * (h / H);
  }
}

class pointBoxMiddle {
  constructor(posA, posB) {
    this.posA = posA;
    this.posB = posB;

    this.x = (pB[posA].x + pB[posB].x) / 2;
    this.y = (pB[posA].y + pB[posB].y) / 2;
  }
}

class pointMiddle {
  constructor(pos1, pos2) {
    this.pos1 = pos1;
    this.pos2 = pos2;

    this.xP = (pP[pos1].x + pP[pos2].x) / 2;
    this.yP = (pP[pos1].y + pP[pos2].y) / 2;
    this.xT = (pT[pos1].x + pT[pos2].x) / 2;
    this.yT = (pT[pos1].y + pT[pos2].y) / 2;
    this.xF = (pF[pos1].x + pF[pos2].x) / 2;
    this.yF = (pF[pos1].y + pF[pos2].y) / 2;
    this.xM = (pM[pos1].x + pM[pos2].x) / 2;
    this.yM = (pM[pos1].y + pM[pos2].y) / 2;

    this.uT = (uT[pos1] + uT[pos2]) / 2;
    this.vT = (vT[pos1] + vT[pos2]) / 2;
    this.uF = (uF[pos1] + uF[pos2]) / 2;
    this.vF = (vF[pos1] + vF[pos2]) / 2;
  }
}

class intersection {
  constructor(x1, y1, x2, y2, x3, y3, x4, y4) {
    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    let x, y;

    if (denom === 0) {
      // 直線が平行な場合、x1,x2およびy1,y2の中点を使用
      x = (x1 + x2) / 2;
      y = (y1 + y2) / 2;
    } else {
      x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
      y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

      // 交点が線分上にあるか確認
      if (
        (x < Math.min(x1, x2) || x > Math.max(x1, x2)) ||
        (x < Math.min(x3, x4) || x > Math.max(x3, x4)) ||
        (y < Math.min(y1, y2) || y > Math.max(y1, y2)) ||
        (y < Math.min(y3, y4) || y > Math.max(y3, y4))
      ) {
        // 交点が線分上にない場合、x1,x2およびy1,y2の中点を使用
        x = (x1 + x2) / 2;
        y = (y1 + y2) / 2;
      }
    }

    this.x = x;
    this.y = y;
  }
}


// スクロール禁止
function disable_scroll() {
  // PCでのスクロール禁止
  document.addEventListener("mousewheel", scroll_control, { passive: false });
  // スマホでのタッチ操作でのスクロール禁止
  document.addEventListener("touchmove", touch_scroll_control, { passive: false });
}
// スクロール禁止解除
function enable_scroll() {
  // PCでのスクロール禁止解除
  document.removeEventListener("mousewheel", scroll_control, { passive: false });
  // スマホでのタッチ操作でのスクロール禁止解除
  document.removeEventListener('touchmove', touch_scroll_control, { passive: false });
}

// スクロール関連メソッド
function scroll_control(event) {
  event.preventDefault();
}

// タッチスクロール関連メソッド
function touch_scroll_control(event) {
  if (event.touches.length > 1) {
    // 2本以上の指での操作はピンチズームとして許可
    return;
  }
  event.preventDefault();
}