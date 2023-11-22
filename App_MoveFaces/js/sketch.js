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
let img;
let res = 2;
let cols = 20 / res;
let rows = 20 / res;
let w;
let pP = [];
let pT = [];

//左目のマークの初期位置
let box_eyeL_x1;
let box_eyeL_y1;
let box_eyeL_x2;
let box_eyeL_y2;
let box_eyeL_x3;
let box_eyeL_y3;

//右目のマークの初期位置
let box_eyeR_x1;
let box_eyeR_y1;
let box_eyeR_x2;
let box_eyeR_y2;
let box_eyeR_x3;
let box_eyeR_y3;

//口のマークの初期位置
let box_mouth_x1;
let box_mouth_y1;
let box_mouth_x2;
let box_mouth_y2;
let box_mouth_x3;
let box_mouth_y3;


let face_results;
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
  //console.log(element_webcam.clientWidth);
}

//キャンパスのサイズ(カメラなし)
function windowResized() {
  let w = windowWidth;
  // let w = element_canvas.clientWidth;
  resizeCanvas(w, w, WEBGL);
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
    if (fileInput.files.length > 0) {

      w = width / (rows - 1);
      //左目のマークの初期位置
      box_eyeL_x1 = w * 2;
      box_eyeL_y1 = w * 2;
      box_eyeL_x2 = w * 4;
      box_eyeL_y2 = w * 4;

      //右目のマークの初期位置
      box_eyeR_x1 = w * 5;
      box_eyeR_y1 = w * 2;
      box_eyeR_x2 = w * 7;
      box_eyeR_y2 = w * 4;

      //口のマークの初期位置
      box_mouth_x1 = w * 2;
      box_mouth_y1 = w * 5;
      box_mouth_x2 = w * 7;
      box_mouth_y2 = w * 7;

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
    windowResized();
    markSetPos();
    drawTexture();
    state++;
    stateButton();
  } else if (state == 3) {
    stateButton();
  }
}

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

//テクスチャの座標初期設定
function textureSetting() {
  w = width / (rows - 1);
  let pPx = 0;
  let pTx = 0;

  for (let i = 0; i < cols; i++) {
    pP[i] = [];
    pT[i] = [];

    let pPy = 0;
    let pTy = 0;

    for (let j = 0; j < rows; j++) {
      pP[i][j] = new pointPosition(pPx, pPy);
      pPy = pPy + w;
      pT[i][j] = new pointTexture(pTx, pTy);
      pTy = pTy + w;
    }
    pPx = pPx + w;
    pTx = pTx + w;
  }
}

//テクスチャ平面の描画
function drawTexture() {
  w = width / (rows - 1);
  noFill();
  noStroke();
  textureMode(NORMAL);

  for (let j = 0; j < rows - 1; j++) {
    beginShape(TRIANGLE_STRIP);
    texture(image);
    for (let i = 0; i < cols; i++) {
      let x1 = pP[i][j].x;
      let y1 = pP[i][j].y;
      let u = map(pT[i][j].x, 0, w * (cols - 1), 0, 1);
      let v1 = map(pT[i][j].y, 0, w * (rows - 1), 0, 1);
      vertex(x1, y1, u, v1);

      let x2 = pP[i][j + 1].x;
      let y2 = pP[i][j + 1].y;
      let u2 = map(pT[i][j + 1].x, 0, w * (cols - 1), 0, 1);
      let v2 = map(pT[i][j + 1].y, 0, w * (rows - 1), 0, 1);
      vertex(x2, y2, u2, v2);
    }
    endShape();
  }

  // for (let j = 0; j < rows - 1; j++) {
  //   for (let i = 0; i < cols; i++) {
  //     stroke(255);
  //     strokeWeight(10);
  //     point(pP[i][j].x, pP[i][j].y);
  //   }
  // }
}

function markingTexture() {
  noFill();
  strokeWeight(4);

  box_eyeL_x3 = (box_eyeL_x1 + box_eyeL_x2) / 2;
  box_eyeL_y3 = (box_eyeL_y1 + box_eyeL_y2) / 2;
  box_eyeR_x3 = (box_eyeR_x1 + box_eyeR_x2) / 2;
  box_eyeR_y3 = (box_eyeR_y1 + box_eyeR_y2) / 2;
  box_mouth_x3 = (box_mouth_x1 + box_mouth_x2) / 2;
  box_mouth_y3 = (box_mouth_y1 + box_mouth_y2) / 2;

  stroke(255);
  beginShape();
  vertex(box_eyeL_x1, box_eyeL_y1);
  vertex(box_eyeL_x2, box_eyeL_y1);
  vertex(box_eyeL_x2, box_eyeL_y2);
  vertex(box_eyeL_x1, box_eyeL_y2);
  endShape(CLOSE);

  beginShape();
  vertex(box_eyeR_x1, box_eyeR_y1);
  vertex(box_eyeR_x2, box_eyeR_y1);
  vertex(box_eyeR_x2, box_eyeR_y2);
  vertex(box_eyeR_x1, box_eyeR_y2);
  endShape(CLOSE);

  beginShape();
  vertex(box_mouth_x1, box_mouth_y1);
  vertex(box_mouth_x2, box_mouth_y1);
  vertex(box_mouth_x2, box_mouth_y2);
  vertex(box_mouth_x1, box_mouth_y2);
  endShape(CLOSE);

  noStroke();
  fill(255);
  ellipse(box_eyeL_x2, box_eyeL_y2, w / 4, w / 4);
  ellipse(box_eyeL_x3, box_eyeL_y3, w / 4, w / 4);
  ellipse(box_eyeR_x2, box_eyeR_y2, w / 4, w / 4);
  ellipse(box_eyeR_x3, box_eyeR_y3, w / 4, w / 4);
  ellipse(box_mouth_x2, box_mouth_y2, w / 4, w / 4);
  ellipse(box_mouth_x3, box_mouth_y3, w / 4, w / 4);
}

function cmousePressed() {
  if (!is_pc) {
    disable_scroll();
  }
}

function cmouseDragged() {
  if (!is_pc) {
    disable_scroll();
  }

  if (mouseIsPressed) {

    let d_eyeL_size = dist(box_eyeL_x2, box_eyeL_y2, mouseX, mouseY);
    let d_eyeL_pos = dist(box_eyeL_x3, box_eyeL_y3, mouseX, mouseY);

    if (d_eyeL_size < w / 4) {
      box_eyeL_x2 = constrain(mouseX, box_eyeL_x1 + w / 4, box_eyeR_x1);
      box_eyeL_y2 = constrain(mouseY, box_eyeL_y1 + w / 4, box_mouth_y1);
    }
    else if (d_eyeL_pos < w / 4) {
      box_eyeL_x1 = mouseX - (box_eyeL_x3 - box_eyeL_x1);
      box_eyeL_x2 = mouseX + (box_eyeL_x2 - box_eyeL_x3);
      box_eyeL_y1 = mouseY - (box_eyeL_y3 - box_eyeL_y1);
      box_eyeL_y2 = mouseY + (box_eyeL_y2 - box_eyeL_y3);
    }

    let d_eyeR_size = dist(box_eyeR_x2, box_eyeR_y2, mouseX, mouseY);
    let d_eyeR_pos = dist(box_eyeR_x3, box_eyeR_y3, mouseX, mouseY);

    if (d_eyeR_size < w / 4) {
      box_eyeR_x2 = constrain(mouseX, box_eyeR_x1, width);
      box_eyeR_y2 = constrain(mouseY, box_eyeR_y1, box_mouth_y1);
    }
    else if (d_eyeR_pos < w / 4) {
      box_eyeR_x1 = mouseX - (box_eyeR_x3 - box_eyeR_x1);
      box_eyeR_x2 = mouseX + (box_eyeR_x2 - box_eyeR_x3);
      box_eyeR_y1 = mouseY - (box_eyeR_y3 - box_eyeR_y1);
      box_eyeR_y2 = mouseY + (box_eyeR_y2 - box_eyeR_y3);
    }

    let d_mouth_size = dist(box_mouth_x2, box_mouth_y2, mouseX, mouseY);
    let d_mouth_pos = dist(box_mouth_x3, box_mouth_y3, mouseX, mouseY);

    if (d_mouth_size < w / 4) {
      box_mouth_x2 = constrain(mouseX, box_mouth_x1, width);
      box_mouth_y2 = constrain(mouseY, box_mouth_y1, height);
    }
    else if (d_mouth_pos < w / 4) {
      box_mouth_x1 = mouseX - (box_mouth_x3 - box_mouth_x1);
      box_mouth_x2 = mouseX + (box_mouth_x2 - box_mouth_x3);
      box_mouth_y1 = mouseY - (box_mouth_y3 - box_mouth_y1);
      box_mouth_y2 = mouseY + (box_mouth_y2 - box_mouth_y3);
    }
  }
}

function markSetPos() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (0 < i & i <= 4) {
        pP[i][1].y = box_eyeL_y1 * 0.9;
        pP[i][2].y = box_eyeL_y1;
        pP[i][3].y = box_eyeL_y2;
        pP[i][4].y = (box_mouth_y1 - box_eyeL_y2) * 0.1 + box_eyeL_y2;
        pP[i][5].y = (box_mouth_y1 - box_eyeL_y2) * 0.9 + box_eyeL_y2;
        pP[i][6].y = box_mouth_y1;
        pP[i][7].y = box_mouth_y2;
        pP[i][8].y = (w * 9 - box_mouth_y2) * 0.1 + box_mouth_y2;
      }
      else if (4 < i & i <= 8) {
        pP[i][1].y = box_eyeR_y1 * 0.9;
        pP[i][2].y = box_eyeR_y1;
        pP[i][3].y = box_eyeR_y2;
        pP[i][4].y = (box_mouth_y1 - box_eyeR_y2) * 0.1 + box_eyeR_y2;
        pP[i][5].y = (box_mouth_y1 - box_eyeR_y2) * 0.9 + box_eyeR_y2;
        pP[i][6].y = box_mouth_y1;
        pP[i][7].y = box_mouth_y2;
        pP[i][8].y = (w * 9 - box_mouth_y2) * 0.1 + box_mouth_y2;
      }

      if (0 < j & j <= 4) {
        pP[1][j].x = box_eyeL_x1 * 0.9;
        pP[2][j].x = box_eyeL_x1;
        pP[3][j].x = box_eyeL_x2;
        pP[4][j].x = (box_eyeR_x1 - box_eyeL_x2) * 0.1 + box_eyeL_x2;
        pP[5][j].x = (box_eyeR_x1 - box_eyeL_x2) * 0.9 + box_eyeL_x2;
        pP[6][j].x = box_eyeR_x1;
        pP[7][j].x = box_eyeR_x2;
        pP[8][j].x = (w * 9 - box_eyeR_x2) * 0.1 + box_eyeR_x2;
      }
      else if (4 < j & j <= 8) {
        pP[1][j].x = box_mouth_x1 * 0.9;
        pP[2][j].x = box_mouth_x1;
        pP[3][j].x = (box_mouth_x2 - box_mouth_x1) / 5 + box_mouth_x1;
        pP[4][j].x = (box_mouth_x2 - box_mouth_x1) * 2 / 5 + box_mouth_x1;
        pP[5][j].x = (box_mouth_x2 - box_mouth_x1) * 3 / 5 + box_mouth_x1;
        pP[6][j].x = (box_mouth_x2 - box_mouth_x1) * 4 / 5 + box_mouth_x1;
        pP[7][j].x = box_mouth_x2;
        pP[8][j].x = (w * 9 - box_mouth_x2) * 0.1 + box_mouth_x2;
      }

      pP[i][j] = new pointPosition(pP[i][j].x, pP[i][j].y);
      pT[i][j] = pP[i][j];
      pT[i][j] = new pointTexture(pT[i][j].x, pT[i][j].y);
    }
  }
}

function animationTexture() {
  // eyeBlinkLeftとeyeBlinkRightの値を取得してコンソールログに表示
  if (face_results.faceBlendshapes && face_results.faceBlendshapes.length > 0) {
    const blendShapes = face_results.faceBlendshapes[0].categories;
    for (let i = 0; i < blendShapes.length; i++) {
      console.log(blendShapes[i].categoryName, blendShapes[i].score.toFixed(4));

      pP[2][2].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[2][2].y, (pT[2][2].y + pT[2][3].y) / 2);
      pP[3][2].y = map(blendShapes[10].score.toFixed(4), 0, 0.8, pT[3][2].y, (pT[3][2].y + pT[3][3].y) / 2);
      pP[2][3].y = map(blendShapes[10].score.toFixed(4), 0.8, 0, (pT[2][2].y + pT[2][3].y) / 2, pT[2][3].y);
      pP[3][3].y = map(blendShapes[10].score.toFixed(4), 0.8, 0, (pT[3][2].y + pT[3][3].y) / 2, pT[3][3].y);

      pP[6][2].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[6][2].y, (pT[6][2].y + pT[6][3].y) / 2);
      pP[7][2].y = map(blendShapes[9].score.toFixed(4), 0, 0.8, pT[7][2].y, (pT[7][2].y + pT[7][3].y) / 2);
      pP[6][3].y = map(blendShapes[9].score.toFixed(4), 0.8, 0, (pT[6][2].y + pT[6][3].y) / 2, pT[6][3].y);
      pP[7][3].y = map(blendShapes[9].score.toFixed(4), 0.8, 0, (pT[7][2].y + pT[7][3].y) / 2, pT[7][3].y);

      pP[2][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[2][6].y, (pT[2][6].y + pT[2][7].y) / 2);
      pP[3][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[3][6].y, (pT[3][6].y + pT[3][7].y) / 2);
      pP[4][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[4][6].y, (pT[4][6].y + pT[4][7].y) / 2);
      pP[5][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[5][6].y, (pT[5][6].y + pT[5][7].y) / 2);
      pP[6][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[6][6].y, (pT[6][6].y + pT[6][7].y) / 2);
      pP[7][6].y = map(blendShapes[25].score.toFixed(4), 1, 0, pT[7][6].y, (pT[7][6].y + pT[7][7].y) / 2);

      pP[2][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[2][6].y + pT[2][7].y) / 2, pT[2][7].y);
      pP[3][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[3][6].y + pT[3][7].y) / 2, pT[3][7].y);
      pP[4][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[4][6].y + pT[4][7].y) / 2, pT[4][7].y);
      pP[5][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[5][6].y + pT[5][7].y) / 2, pT[5][7].y);
      pP[6][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[6][6].y + pT[6][7].y) / 2, pT[6][7].y);
      pP[7][7].y = map(blendShapes[25].score.toFixed(4), 0, 1, (pT[7][6].y + pT[7][7].y) / 2, pT[7][7].y);

      pP[2][6].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[2][6].x, (pT[2][6].x + pT[3][6].x) / 2);
      pP[7][6].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[7][6].x, (pT[6][6].x + pT[7][6].x) / 2);
      pP[2][7].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[2][7].x, (pT[2][7].x + pT[3][7].x) / 2);
      pP[7][7].x = map(blendShapes[38].score.toFixed(4), 0, 1, pT[7][7].x, (pT[6][7].x + pT[7][7].x) / 2);

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