document.querySelector('#returnButton').style.display = 'none';
document.querySelector('#mainButton').style.display = 'none';
document.querySelector('#inputButton').style.display = 'none';
document.querySelector('#uploadImg').style.display = 'none';

// import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import { FaceLandmarker, FilesetResolver } from "./vision_bundle.js";
const videoBlendShapes = document.getElementById("video-blend-shapes");
var faceLandmarker;
let runningMode = "IMAGE";
// Initialize the object detector
const createFaceLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("./wasm");
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `./models/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: runningMode,
        numFaces: 1
    });
    enableCam();
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#mainButton').style.display = 'inline';
    document.querySelector('#inputButton').style.display = 'inline';
    document.querySelector('#uploadImg').style.display = 'inline';
};
createFaceLandmarker();

/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
let enableWebcamButton;

// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// Keep a reference of all the child elements we create
// so we can remove them easilly on each render.
var children = [];
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    // enableWebcamButton = document.getElementById("webcamButton");
    // enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
async function enableCam(event) {
    if (!FaceLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }

    // getUsermedia parameters.
    const constraints = {
        // video: true
        video: {
            facingMode: 'user'
        }
    };
    // Activate the webcam stream.
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
        })
        .catch((err) => {
            console.error(err);
            /* handle the error */
        });
}
let lastVideoTime = -1;
async function predictWebcam() {
    // if image mode is initialized, create a new classifier with video runningMode
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await faceLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let nowInMs = Date.now();
    // Detect objects using detectForVideo
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = await faceLandmarker.detectForVideo(video, nowInMs);

        //displayVideoDetections(detections);
        gotFaces(results);
        drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
    }
    // Call this function again to keep predicting when the browser is ready
    window.requestAnimationFrame(predictWebcam);
}

function drawBlendShapes(el, blendShapes) {
    if (!blendShapes.length) {
        return;
    }

    //blendShapesのグラフの描画
    // let htmlMaker = "";
    // blendShapes[0].categories.map((shape) => {
    //     htmlMaker += `
    //   <li class="blend-shapes-item">
    //     <span class="blend-shapes-label">${shape.displayName || shape.categoryName}</span>
    //     <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">${(+shape.score).toFixed(4)}</span>
    //   </li>
    // `;
    // });
    // el.innerHTML = htmlMaker;
}