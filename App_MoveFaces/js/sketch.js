// シーンの状態を表す定数
const STATE_SERECT = 0;
const STATE_LINE = 1;
const STATE_RECORDING = 2;

// シーンの状態
let state = STATE_SERECT;
let stateMessage;
let stateMessageEn;
let fileName;

//テクスチャ
let w;
let boxPoint = 12;
let pP = [];
let pT = [];
let pB = [];
let u = [];
let v = [];
let boxMiddlePos = [];
let middlePointSide = [];
let middlePointParts = [];


//顔の判定
let face_results;

//デバイス判定
let is_pc;

function setup() {
  let p5canvas = createCanvas(400, 400, WEBGL);
  p5canvas.parent('#canvas');

  //機種による処理
  if (navigator.userAgent.indexOf('iPhone') > 0 ||
    navigator.userAgent.indexOf('iPod') > 0 ||
    (navigator.userAgent.indexOf('Android') > 0 &&
      navigator.userAgent.indexOf('Mobile') > 0)) {
    //スマホ用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchMoved(cmouseDragged);
    disable_scroll();
    is_pc = false;
  } else if (navigator.userAgent.indexOf('iPad') > 0 ||
    navigator.userAgent.indexOf('Android') > 0) {
    //タブレット用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchMoved(cmouseDragged);
    disable_scroll();
    is_pc = false;
  } else if (navigator.userAgent.indexOf('Safari') > 0 &&
    navigator.userAgent.indexOf('Chrome') == -1 &&
    typeof document.ontouchstart !== 'undefined') {
    //iOS13以降のiPad用の処理
    p5canvas.touchStarted(cmousePressed);
    p5canvas.touchMoved(cmouseDragged);
    disable_scroll();
    is_pc = false;
  } else {
    p5canvas.mousePressed(cmousePressed);
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

  //元々180度回転していた座標系がもとに戻る
  scale(-1, 1);

  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
  if (face_results) {
    for (let landmarks of face_results.faceLandmarks) {
      for (let i = 0; i < landmarks.length; i++) {
        fill(255);
        noStroke();
        circle(landmarks[i].x * width - width / 2, landmarks[i].y * height - height / 2, 2);
      }
    }

    if (state === STATE_SERECT) {
      adjustCanvas();
    }
    else if (state === STATE_LINE) {
      windowResized();
      textureSetting();
      drawTexture();
      markingTexture();
    } else if (state === STATE_RECORDING) {
      windowResized();
      animationTexture();
      drawTexture();
    }

    // for (let landmarks of face_results.faceLandmarks) {
    //   for (let i = 0; i < landmarks.length; i++) {
    //     fill(255);
    //     noStroke();
    //     circle(landmarks[i].x * width, landmarks[i].y * height, w / 15);
    //   }
    // }
  }
}

var element_webcam = document.getElementById('webcam');
var element_canvas = document.getElementById('canvas');
var fileInput = document.getElementById('inputButton');
var element_return = document.getElementById('returnButton');
var element_main = document.getElementById('mainButton');

//キャンパスのサイズ(カメラあり)
function adjustCanvas() {
  // Get an element by its ID
  resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
  w = width;
  // console.log(element_webcam.clientWidth);
  // console.log(windowWidth);
}

//キャンパスのサイズ(カメラなし)
function windowResized() {
  w = windowWidth;
  h = w * image.height / image.width;
  // let w = element_canvas.clientWidth;
  resizeCanvas(w, h, WEBGL);
  translate(-width / 2, -height / 2);
}

//画像アップロード
function previewFile(file) {
  // FileReaderオブジェクトを作成
  const reader = new FileReader();

  // ファイルが読み込まれたときに実行する
  reader.onload = function (e) {
    imageUrl = e.target.result; // 画像のURLはevent.target.resultで呼び出せる
    image = loadImage(imageUrl);
  }
  // いざファイルを読み込む
  reader.readAsDataURL(file);
}

//画像のインプットボタン
function inputButtonPressed() {
  // <input>でファイルが選択されたときの処理
  const handleFileSelect = () => {
    const files = fileInput.files;
    // previewFile(files);
    for (let i = 0; i < files.length; i++) {
      previewFile(files[i]);
      fileName = files[i].name;
      console.log(fileName);
    }
  }
  fileInput.addEventListener('change', handleFileSelect);
}

//ボタンの処理
function stateButton() {
  if (state === STATE_SERECT) {
    element_webcam.style.display = 'inline';
    element_canvas.style.display = 'none';
    fileInput.style.display = 'inline';
    stateMessage = "写真を選択して下さい";
    stateMessageEn = "Please select the photo you would like to use.";
  } else if (state === STATE_LINE) {
    element_webcam.style.display = 'none';
    element_canvas.style.display = 'inline';
    fileInput.style.display = 'none';
    stateMessage = "目と口に合わせて白枠を動かしてください";
    stateMessageEn = "Move the white frame to match the eyes and mouth.";
  } else if (state === STATE_RECORDING) {
    stateMessage = "顔を動かしてみましょう😄";
    stateMessageEn = "Let's move your face😄";
  }
  document.getElementById("mainMessage").innerHTML = stateMessage;
  document.getElementById("mainMessageEn").innerHTML = stateMessageEn;
}

//メインボタンの処理
function mainButtonPressed() {
  if (state == 0) {
    boxSetting();

    if (fileInput.files.length > 0) {
      state++;
      stateButton();
      // 既存のアラートメッセージがあれば削除
      const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
      const existingAlerts = alertPlaceholder.getElementsByClassName('alert');
      for (const alert of existingAlerts) {
        alert.remove();
      }
    } else if (fileInput.files.length == 0) {
      displayFileNotSelectedAlert();
    }

  } else if (state == 1) {
    state++;
    stateButton();
  } else if (state == 3) {
    stateButton();
  }
}

//ファイルが選択されていないときのアラートメッセージ
function displayFileNotSelectedAlert() {
  const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
  const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible mt-2" role="alert">`,
      ` <div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16" aria-label="Warning:">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          ${message}
        </div>`,
      ' <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
  }

  // 既存のアラートメッセージがあれば削除
  const existingAlerts = alertPlaceholder.getElementsByClassName('alert');
  for (const alert of existingAlerts) {
    alert.remove();
  }
  // アラートメッセージを表示する関数を呼び出し
  appendAlert('ファイルを選択して下さい。 Please select a file.', 'warning');
}

//リターンボタンの処理
function returnButtonPressed() {
  if (0 < state && state <= 2) {
    state--;
    stateButton();
  }
}

//ボックスの初期設定
function boxSetting() {
  let boxSize = w / 5;
  for (let i = 0; i < boxPoint; i++) {

    //ボックスの初期設定
    pB[i] = [];
    pB[i] = new pointBox(pB[i].x, pB[i].y);

    if (i == 0 || i == 3 || i == 8 || i == 11) {
      pB[i].x = boxSize;
    } else if (i == 1 || i == 2) {
      pB[i].x = boxSize * 2;
    } else if (i == 4 || i == 7) {
      pB[i].x = boxSize * 3;
    } else if (i == 5 || i == 6 || i == 9 || i == 10) {
      pB[i].x = boxSize * 4;
    }

    if (i == 0 || i == 1 || i == 4 || i == 5) {
      pB[i].y = boxSize;
    } else if (i == 2 || i == 3 || i == 6 || i == 7) {
      pB[i].y = boxSize * 2;
    } else if (i == 8 || i == 9) {
      pB[i].y = boxSize * 3;
    } else if (i == 10 || i == 11) {
      pB[i].y = boxSize * 4;
    }
  }
}

//テクスチャの座標初期設定
function textureSetting() {
  for (let i = 0; i < boxPoint; i++) {
    pP[i] = [];
    pT[i] = [];
    middlePointSide[i] = [];

    //ここのおかげでテクスチャの座標が変わらない、多分
    pP[i] = new pointPosition(pB[i].x, pB[i].y);
    pT[i] = new pointTexture(pB[i].x, pB[i].y);
  }
}

//テクスチャ平面の描画
function drawTexture() {
  noFill();
  noStroke();
  textureMode(NORMAL);
  texture(image);

  //uv座標の設定
  for (let i = 0; i < boxPoint; i++) {
    u[i] = map(pT[i].x, 0, width, 0, 1);
  }
  for (let i = 0; i < boxPoint; i++) {
    v[i] = map(pT[i].y, 0, height, 0, 1);
  }

  //テクスチャの描画(全面)
  beginShape();
  vertex(0, 0, 0, 0);
  vertex(w, 0, 1, 0);
  vertex(w, h, 1, 1);
  vertex(0, h, 0, 1);
  endShape(CLOSE);

  //テクスチャの描画(伸びるところ)
  for (let i = 0; i < boxPoint; i++) {
    if (i < 3 || (3 < i && i < 7) || (7 < i && i < 11)) {
      middlePointSide[i] = new pointMiddle(i, i + 1);
      beginShape(TRIANGLE_STRIP);
      vertex(pT[i].x, pT[i].y, u[i], v[i]);
      vertex(pP[i].x, pP[i].y, u[i], v[i]);
      vertex(middlePointSide[i].x, middlePointSide[i].y, middlePointSide[i].u, middlePointSide[i].v);
      vertex(pP[i + 1].x, pP[i + 1].y, u[i + 1], v[i + 1]);
      vertex(pT[i + 1].x, pT[i + 1].y, u[i + 1], v[i + 1]);
      endShape(CLOSE);
    } else if (i == 3 || i == 7 || i == 11) {
      middlePointSide[i] = new pointMiddle(i, i - 3);
      beginShape(TRIANGLE_STRIP);
      vertex(pT[i].x, pT[i].y, u[i], v[i]);
      vertex(pP[i].x, pP[i].y, u[i], v[i]);
      vertex(middlePointSide[i].x, middlePointSide[i].y, middlePointSide[i].u, middlePointSide[i].v);
      vertex(pP[i - 3].x, pP[i - 3].y, u[i - 3], v[i - 3]);
      vertex(pT[i - 3].x, pT[i - 3].y, u[i - 3], v[i - 3]);
      endShape(CLOSE);
    }
  }

  //テクスチャの描画(伸びないところ)
  for (let i = 0; i < boxPoint; i++) {
    if (i < 2 || (3 < i && i < 6) || (7 < i && i < 10)) {
      middlePointParts = new pointMiddle(i, i + 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, u[i], v[i]);
      vertex(middlePointParts.x, middlePointParts.y, middlePointParts.u, middlePointParts.v);
      vertex(pP[i + 1].x, pP[i + 1].y, u[i + 1], v[i + 1]);
      endShape(CLOSE);
    } else if (i == 2 || i == 6 || i == 10) {
      middlePointParts = new pointMiddle(i, i - 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, u[i], v[i]);
      vertex(middlePointParts.x, middlePointParts.y, middlePointParts.u, middlePointParts.v);
      vertex(pP[i + 1].x, pP[i + 1].y, u[i + 1], v[i + 1]);
      endShape(CLOSE);
    } else if (i == 3 || i == 7 || i == 11) {
      middlePointParts = new pointMiddle(i, i - 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, u[i], v[i]);
      vertex(middlePointParts.x, middlePointParts.y, middlePointParts.u, middlePointParts.v);
      vertex(pP[i - 3].x, pP[i - 3].y, u[i - 3], v[i - 3]);
      endShape(CLOSE);
    }
  }

  // for (let j = 0; j < rows - 1; j++) {
  //   for (let i = 0; i < cols; i++) {
  //     stroke(255);
  //     strokeWeight(10);
  //     point(pP[i][j].x, pP[i][j].y);
  //   }
  // }
}

//ボックスの描画
function markingTexture() {
  for (let i = 0; i < boxPoint; i++) {
    pB[i] = new pointBox(pB[i].x, pB[i].y);
    if (i == 0 || i == 4 || i == 8) {
      //ボックスの線の描画の設定
      strokeWeight(4);
      stroke(255);
      noFill();

      //ボックスの線の描画
      beginShape();
      vertex(pB[i].x, pB[i].y);
      vertex(pB[i + 1].x, pB[i + 1].y);
      vertex(pB[i + 2].x, pB[i + 2].y);
      vertex(pB[i + 3].x, pB[i + 3].y);
      endShape(CLOSE);

      //ボックスの点の描画の設定
      noStroke();
      fill(255);
      let boxPointSize = w / 50;

      //ボックスの移動用の点の描画
      ellipse(pB[i + 2].x, pB[i + 2].y, boxPointSize, boxPointSize);

      //ボックスの中心点の描画
      let leftEyeBoxMiddlePos = new pointBoxMiddle(i, i + 2);
      ellipse(leftEyeBoxMiddlePos.x, leftEyeBoxMiddlePos.y, boxPointSize, boxPointSize);
    }
  }
}

function cmousePressed() {
  if (!is_pc) {
    disable_scroll();
  }
}

//ボックスの移動
function cmouseDragged() {
  if (!is_pc) {
    disable_scroll();
  }

  if (mouseIsPressed) {
    let mouseRange = w / 50;
    for (let i = 0; i < boxPoint; i++) {
      if (i == 0 || i == 4 || i == 8) {

        boxMiddlePos[i] = new pointBoxMiddle(i, i + 2);
        let boxPosDist = dist(boxMiddlePos[i].x, boxMiddlePos[i].y, mouseX, mouseY);
        let boxSizeDist = dist(pB[i + 2].x, pB[i + 2].y, mouseX, mouseY);

        let box_x1;
        let box_x2;
        let box_y1;
        let box_y2;

        if (boxPosDist < mouseRange) {
          box_x1 = mouseX - (boxMiddlePos[i].x - pB[i].x);
          box_x2 = mouseX + (pB[i + 2].x - boxMiddlePos[i].x);
          box_y1 = mouseY - (boxMiddlePos[i].y - pB[i].y);
          box_y2 = mouseY + (pB[i + 2].y - boxMiddlePos[i].y);

          pB[i] = new pointBox(box_x1, box_y1);
          pB[i + 1] = new pointBox(box_x2, box_y1);
          pB[i + 2] = new pointBox(box_x2, box_y2);
          pB[i + 3] = new pointBox(box_x1, box_y2);
        }
        else if (boxSizeDist < mouseRange) {
          pB[i + 1].x = mouseX;
          pB[i + 2].x = mouseX;
          pB[i + 2].y = mouseY;
          pB[i + 3].y = mouseY;
        }
      }
    }
  }
}

//顔を動かす
function animationTexture() {
  // eyeBlinkLeftとeyeBlinkRightの値を取得してコンソールログに表示
  if (face_results.faceBlendshapes && face_results.faceBlendshapes.length > 0) {
    const blendShapes = face_results.faceBlendshapes[0].categories;
    for (let i = 0; i < blendShapes.length; i++) {
      // console.log(blendShapes[i].categoryName, blendShapes[i].score.toFixed(4));

      //左目のアニメーション
      pP[0].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[0].y, (pT[0].y + pT[3].y) / 2);
      pP[1].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[1].y, (pT[1].y + pT[2].y) / 2);
      pP[2].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[2].y, (pT[1].y + pT[2].y) / 2);
      pP[3].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[3].y, (pT[0].y + pT[3].y) / 2);

      //右目のアニメーション
      pP[4].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[4].y, (pT[4].y + pT[7].y) / 2);
      pP[5].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[5].y, (pT[5].y + pT[6].y) / 2);
      pP[6].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[6].y, (pT[5].y + pT[6].y) / 2);
      pP[7].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[7].y, (pT[4].y + pT[7].y) / 2);

      //口のアニメーション
      pP[8].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[8].y, (pT[8].y + pT[11].y) / 2);
      pP[9].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[9].y, (pT[9].y + pT[10].y) / 2);
      pP[10].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[10].y, (pT[9].y + pT[10].y) / 2);
      pP[11].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[11].y, (pT[8].y + pT[11].y) / 2);

      //口のアニメーション
      pP[8].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[8].x, (pT[8].x + pT[9].x) / 2);
      pP[9].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[9].x, (pT[8].x + pT[9].x) / 2);
      pP[10].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[10].x, (pT[10].x + pT[11].x) / 2);
      pP[11].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[11].x, (pT[10].x + pT[11].x) / 2);
    }
  }
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

class pointBox {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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

    this.x = (pT[pos1].x + pT[pos2].x) / 2;
    this.y = (pT[pos1].y + pT[pos2].y) / 2;
    this.u = (u[pos1] + u[pos2]) / 2;
    this.v = (v[pos1] + v[pos2]) / 2;
  }
}

// スクロール禁止
function disable_scroll() {
  // PCでのスクロール禁止
  document.addEventListener("mousewheel", scroll_control, { passive: false });
  // スマホでのタッチ操作でのスクロール禁止
  document.addEventListener("touchmove", scroll_control, { passive: false });
}
// スクロール禁止解除
function enable_scroll() {
  // PCでのスクロール禁止解除
  document.removeEventListener("mousewheel", scroll_control, { passive: false });
  // スマホでのタッチ操作でのスクロール禁止解除
  document.removeEventListener('touchmove', scroll_control, { passive: false });
}

// スクロール関連メソッド
function scroll_control(event) {
  event.preventDefault();
}