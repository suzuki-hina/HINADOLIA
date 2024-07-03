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
let pF = [];

let pB = [];
let pS = [];

let uT = [];
let vT = [];
let uF = [];
let vF = [];

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
  } else if (state == 2) {
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
  let boxRange = w / 20;
  for (let i = 0; i < boxPoint; i++) {

    //ボックスの初期設定
    pB[i] = [];
    pB[i] = new pointBox(pB[i].x, pB[i].y);

    pS[i] = [];
    pS[i] = new pointStrech(pS[i].x, pS[i].y);

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

    if (i == 0 || i == 3 || i == 4 || i == 7 || i == 8 || i == 11) {
      pS[i].x = pB[i].x - boxRange;
    } else if (i == 1 || i == 2 || i == 5 || i == 6 || i == 9 || i == 10) {
      pS[i].x = pB[i].x + boxRange;
    }

    if (i == 0 || i == 1 || i == 4 || i == 5 || i == 8 || i == 9) {
      pS[i].y = pB[i].y - boxRange;
    } else if (i == 2 || i == 3 || i == 6 || i == 7 || i == 10 || i == 11) {
      pS[i].y = pB[i].y + boxRange;
    }

  }
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
    uT[i] = map(pT[i].x, 0, width, 0, 1);
    uF[i] = map(pF[i].x, 0, width, 0, 1);
  }
  for (let i = 0; i < boxPoint; i++) {
    vT[i] = map(pT[i].y, 0, height, 0, 1);
    vF[i] = map(pF[i].y, 0, height, 0, 1);
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
    if (i < 2 || (3 < i && i < 6) || (7 < i && i < 10)) {
      middlePointParts = new pointMiddle(i, i + 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(middlePointParts.xP, middlePointParts.yP, middlePointParts.uF, middlePointParts.vF);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      endShape(CLOSE);
    } else if (i == 2 || i == 6 || i == 10) {
      middlePointParts = new pointMiddle(i, i - 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(middlePointParts.xP, middlePointParts.yP, middlePointParts.uF, middlePointParts.vF);
      vertex(pP[i + 1].x, pP[i + 1].y, uF[i + 1], vF[i + 1]);
      endShape(CLOSE);
    } else if (i == 3 || i == 7 || i == 11) {
      middlePointParts = new pointMiddle(i, i - 2);
      beginShape(TRIANGLE_STRIP);
      vertex(pP[i].x, pP[i].y, uF[i], vF[i]);
      vertex(middlePointParts.xP, middlePointParts.yP, middlePointParts.uF, middlePointParts.vF);
      vertex(pP[i - 3].x, pP[i - 3].y, uF[i - 3], vF[i - 3]);
      endShape(CLOSE);
    }
  }

  // for (let i = 0; i < boxPoint; i++) {
  //   stroke(255);
  //   strokeWeight(10);
  //   point(pP[i].x, pP[i].y);
  //   point(pT[i].x, pT[i].y);
  // }
}

//ボックスの描画
function markingTexture() {
  for (let i = 0; i < boxPoint; i++) {
    pB[i] = new pointBox(pB[i].x, pB[i].y);
    pS[i] = new pointStrech(pS[i].x, pS[i].y);
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

      //伸びの線の描画の設定
      strokeWeight(2);
      stroke(255);
      noFill();

      //伸びの線の描画
      beginShape();
      vertex(pS[i].x, pS[i].y);
      vertex(pS[i + 1].x, pS[i + 1].y);
      vertex(pS[i + 2].x, pS[i + 2].y);
      vertex(pS[i + 3].x, pS[i + 3].y);
      endShape(CLOSE);
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
        let strechSizeDist = dist(pS[i + 2].x, pS[i + 2].y, mouseX, mouseY);

        let box_x1;
        let box_x2;
        let box_y1;
        let box_y2;

        let strech_x1;
        let strech_x2;
        let strech_y1;
        let strech_y2;

        if (boxPosDist < mouseRange) {
          box_x1 = mouseX - (boxMiddlePos[i].x - pB[i].x);
          box_x2 = mouseX + (pB[i + 2].x - boxMiddlePos[i].x);
          box_y1 = mouseY - (boxMiddlePos[i].y - pB[i].y);
          box_y2 = mouseY + (pB[i + 2].y - boxMiddlePos[i].y);

          pB[i] = new pointBox(box_x1, box_y1);
          pB[i + 1] = new pointBox(box_x2, box_y1);
          pB[i + 2] = new pointBox(box_x2, box_y2);
          pB[i + 3] = new pointBox(box_x1, box_y2);

          strech_x1 = mouseX - (boxMiddlePos[i].x - pS[i].x);
          strech_x2 = mouseX + (pS[i + 2].x - boxMiddlePos[i].x);
          strech_y1 = mouseY - (boxMiddlePos[i].y - pS[i].y);
          strech_y2 = mouseY + (pS[i + 2].y - boxMiddlePos[i].y);

          pS[i] = new pointBox(strech_x1, strech_y1);
          pS[i + 1] = new pointBox(strech_x2, strech_y1);
          pS[i + 2] = new pointBox(strech_x2, strech_y2);
          pS[i + 3] = new pointBox(strech_x1, strech_y2);
        }
        else if (boxSizeDist < mouseRange) {
          pB[i].x = boxMiddlePos[i].x - abs(mouseX - boxMiddlePos[i].x);
          pB[i].y = boxMiddlePos[i].y - abs(mouseY - boxMiddlePos[i].y);
          pB[i + 1].x = mouseX;
          pB[i + 1].y = boxMiddlePos[i].y - abs(mouseY - boxMiddlePos[i].y);
          pB[i + 2].x = mouseX;
          pB[i + 2].y = mouseY;
          pB[i + 3].x = boxMiddlePos[i].x - abs(mouseX - boxMiddlePos[i].x);
          pB[i + 3].y = mouseY;
        }
        else if (strechSizeDist < mouseRange) {
          pS[i].x = boxMiddlePos[i].x - abs(mouseX - boxMiddlePos[i].x);
          pS[i].y = boxMiddlePos[i].y - abs(mouseY - boxMiddlePos[i].y);
          pS[i + 1].x = mouseX;
          pS[i + 1].y = boxMiddlePos[i].y - abs(mouseY - boxMiddlePos[i].y);
          pS[i + 2].x = mouseX;
          pS[i + 2].y = mouseY;
          pS[i + 3].x = boxMiddlePos[i].x - abs(mouseX - boxMiddlePos[i].x);
          pS[i + 3].y = mouseY;
        }
      }
    }
  }
}

//顔を動かす
function animationTexture() {
  let eyeMax = 0.8;
  let AmouthMax = 0.8;
  let UmouthMax = 0.8;
  let ImouthMax = 0.8;

  // eyeBlinkLeftとeyeBlinkRightの値を取得してコンソールログに表示
  if (face_results.faceBlendshapes && face_results.faceBlendshapes.length > 0) {
    const blendShapes = face_results.faceBlendshapes[0].categories;
    for (let i = 0; i < blendShapes.length; i++) {

      let eyeBlinkLeftScore = blendShapes[9].score.toFixed(3);
      let eyeBlinkRightScore = blendShapes[10].score.toFixed(3);
      let eyeLookDownLeftScore = blendShapes[11].score.toFixed(3);
      let eyeLookDownRightScore = blendShapes[12].score.toFixed(3);
      let eyeLookInLeftScore = blendShapes[13].score.toFixed(3);
      let eyeLookInRightScore = blendShapes[15].score.toFixed(3);
      let eyeLookOutLeftScore = blendShapes[14].score.toFixed(3);
      let eyeLookOutRightScore = blendShapes[16].score.toFixed(3);
      let eyeLookUpLeftScore = blendShapes[17].score.toFixed(3);
      let eyeLookUpRightScore = blendShapes[18].score.toFixed(3);
      let mouthOpenScore = blendShapes[25].score.toFixed(3);
      let mouthSmileScore = blendShapes[38].score.toFixed(3);
      let mouthFrownScore = blendShapes[39].score.toFixed(3);
      let mouthStretchRightScore = blendShapes[44].score.toFixed(3);
      let mouthRollLowerScore = blendShapes[45].score.toFixed(3);

      //左目のアニメーション
      middlePointParts = new pointMiddle(0, 2);
      if (0 <= i && i <= 3) {
        //左目が左右に動いたときのアニメーション
        if (eyeLookInLeftScore > eyeLookOutLeftScore) {
          pP[i].x = map(eyeLookInLeftScore, 0, 1, pF[i].x, pF[i].x + 30);
        }
        else if (eyeLookOutLeftScore > eyeLookInLeftScore) {
          pP[i].x = map(eyeLookOutLeftScore, 0, 1, pF[i].x, pF[i].x - 30);
        }

        //左目が上下に動いたときのアニメーション
        if (eyeLookUpLeftScore > eyeLookDownLeftScore) {
          pP[i].y = map(eyeLookUpLeftScore, 0, 1, pF[i].y, pF[i].y - 30);
        }
        else if (eyeLookDownLeftScore > eyeLookUpLeftScore) {
          pP[i].y = map(eyeLookDownLeftScore, 0, 1, pF[i].y, pF[i].y + 30);
        }

        //左目瞬きのアニメーション
        pP[i].y = map(eyeBlinkLeftScore, 0, eyeMax, pF[i].y, middlePointParts.yF);
      }

      //右目のアニメーション
      middlePointParts = new pointMiddle(4, 6);
      if (4 <= i && i <= 7) {
        //右目が左右に動いたときのアニメーション
        if (eyeLookInRightScore > eyeLookOutRightScore) {
          pP[i].x = map(eyeLookInRightScore, 0, 1, pF[i].x, pF[i].x - 30);
        }
        else if (eyeLookOutRightScore > eyeLookInRightScore) {
          pP[i].x = map(eyeLookOutRightScore, 0, 1, pF[i].x, pF[i].x + 30);
        }

        //右目が上下に動いたときのアニメーション
        if (eyeLookUpRightScore > eyeLookDownRightScore) {
          pP[i].y = map(eyeLookUpRightScore, 0, 1, pF[i].y, pF[i].y - 30);
        }
        else if (eyeLookDownRightScore > eyeLookUpRightScore) {
          pP[i].y = map(eyeLookDownRightScore, 0, 1, pF[i].y, pF[i].y + 30);
        }

        //右目瞬きのアニメーション
        pP[i].y = map(eyeBlinkRightScore, 0, eyeMax, pF[i].y, middlePointParts.yF);
      }

      //口のアニメーション
      let mouthU_Trisect = (pF[9].x - pF[8].x) / 5;
      let mouthL_Trisect = (pF[10].x - pF[11].x) / 5;
      let mouthL_Middle = (pF[8].y + pF[11].y) / 2;
      let mouthR_Middle = (pF[9].y + pF[10].y) / 2;


      if (blendShapes[25].score.toFixed(3) > 0) {
        if (blendShapes[38].score.toFixed(3) > 0.1) {
          pP[8] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[8].x + mouthU_Trisect, pF[8].x + mouthU_Trisect * 2),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[8].y)
          );
          pP[9] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[9].x - mouthU_Trisect, pF[9].x - mouthU_Trisect * 2),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[9].y)
          );
          pP[10] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[10].x - mouthL_Trisect, pF[10].x - mouthL_Trisect * 2),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[10].y)
          );
          pP[11] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[11].x + mouthL_Trisect, pF[11].x + mouthL_Trisect * 2),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[11].y)
          );
        }
        else if (blendShapes[44].score.toFixed(4) > 0.1 || blendShapes[45].score.toFixed(4) > 0.1) {
          pP[8] = new pointPosition(
            map(blendShapes[44].score.toFixed(3), 0, ImouthMax, pF[8].x + mouthU_Trisect, pF[8].x),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[8].y)
          );
          pP[9] = new pointPosition(
            map(blendShapes[45].score.toFixed(3), 0, ImouthMax, pF[9].x - mouthU_Trisect, pF[9].x),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[9].y)
          );
          pP[10] = new pointPosition(
            map(blendShapes[45].score.toFixed(3), 0, ImouthMax, pF[10].x - mouthL_Trisect, pF[10].x),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[10].y)
          );
          pP[11] = new pointPosition(
            map(blendShapes[44].score.toFixed(3), 0, ImouthMax, pF[11].x + mouthL_Trisect, pF[11].x),
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[11].y)
          );
        }
        else {
          pP[8] = new pointPosition(
            pF[8].x + mouthU_Trisect,
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[8].y)
          );
          pP[9] = new pointPosition(
            pF[9].x - mouthU_Trisect,
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[9].y)
          );
          pP[10] = new pointPosition(
            pF[10].x - mouthL_Trisect,
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthR_Middle, pF[10].y)
          );
          pP[11] = new pointPosition(
            pF[11].x + mouthL_Trisect,
            map(blendShapes[25].score.toFixed(3), 0, AmouthMax, mouthL_Middle, pF[11].y)
          );
        }
      }
      else {
        if (blendShapes[38].score.toFixed(4) > 0.1) {
          pP[8] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[8].x + mouthU_Trisect, pF[8].x + mouthU_Trisect * 2),
            mouthL_Middle
          );
          pP[9] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[9].x - mouthU_Trisect, pF[9].x - mouthU_Trisect * 2),
            mouthR_Middle
          );
          pP[10] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[10].x - mouthL_Trisect, pF[10].x - mouthL_Trisect * 2),
            mouthR_Middle
          );
          pP[11] = new pointPosition(
            map(blendShapes[38].score.toFixed(3), 0, UmouthMax, pF[11].x + mouthL_Trisect, pF[11].x + mouthL_Trisect * 2),
            mouthL_Middle
          );
        } else if (blendShapes[44].score.toFixed(4) > 0.1 || blendShapes[45].score.toFixed(4) > 0.1) {
          pP[8] = new pointPosition(
            map(blendShapes[44].score.toFixed(3), 0, ImouthMax, pF[8].x + mouthU_Trisect, pF[8].x),
            mouthL_Middle
          );
          pP[9] = new pointPosition(
            map(blendShapes[45].score.toFixed(3), 0, ImouthMax, pF[9].x - mouthU_Trisect, pF[9].x),
            mouthR_Middle
          );
          pP[10] = new pointPosition(
            map(blendShapes[45].score.toFixed(3), 0, ImouthMax, pF[10].x - mouthL_Trisect, pF[10].x),
            mouthR_Middle
          );
          pP[11] = new pointPosition(
            map(blendShapes[44].score.toFixed(3), 0, ImouthMax, pF[11].x + mouthL_Trisect, pF[11].x),
            mouthL_Middle
          );
        } else {
          pP[8] = new pointPosition(
            pF[8].x + mouthU_Trisect,
            mouthL_Middle
          );
          pP[9] = new pointPosition(
            pF[9].x - mouthU_Trisect,
            mouthR_Middle
          );
          pP[10] = new pointPosition(
            pF[10].x - mouthL_Trisect,
            mouthR_Middle
          );
          pP[11] = new pointPosition(
            pF[11].x + mouthL_Trisect,
            mouthL_Middle
          );
        }
      }
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

class pointFix {
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

class pointStrech {
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

    this.xP = (pP[pos1].x + pP[pos2].x) / 2;
    this.yP = (pP[pos1].y + pP[pos2].y) / 2;
    this.xT = (pT[pos1].x + pT[pos2].x) / 2;
    this.yT = (pT[pos1].y + pT[pos2].y) / 2;
    this.xF = (pF[pos1].x + pF[pos2].x) / 2;
    this.yF = (pF[pos1].y + pF[pos2].y) / 2;

    this.uT = (uT[pos1] + uT[pos2]) / 2;
    this.vT = (vT[pos1] + vT[pos2]) / 2;
    this.uF = (uF[pos1] + uF[pos2]) / 2;
    this.vF = (vF[pos1] + vF[pos2]) / 2;
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