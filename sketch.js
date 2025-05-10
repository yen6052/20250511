// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
const circleRadius = 50; // 圓的半徑
let isDragging = false; // 是否正在拖曳圓形
let prevX, prevY; // 儲存上一個手指位置

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 圓形初始位置在畫布中央
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 畫出圓形
  fill(0, 255, 0);
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 確保至少有一隻手被偵測到
  if (hands.length > 0) {
    let fingerX, fingerY;

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 獲取食指尖端的座標 (keypoints[8])
        const indexFingerTip = hand.keypoints[8];
        fingerX = indexFingerTip.x;
        fingerY = indexFingerTip.y;

        const dx = fingerX - circleX;
        const dy = fingerY - circleY;

        // 檢查食指尖端是否接觸到圓形
        if (sqrt(dx * dx + dy * dy) < circleRadius) {
          // 如果接觸到，讓圓形跟隨食指尖端移動
          if (!isDragging) {
            // 開始拖曳時初始化上一個位置
            prevX = fingerX;
            prevY = fingerY;
          }
          isDragging = true;
          circleX = fingerX;
          circleY = fingerY;

          // 畫出手指的軌跡
          stroke(0, 0, 139); // 深藍色
          strokeWeight(4);
          line(prevX, prevY, fingerX, fingerY);

          // 更新上一個位置
          prevX = fingerX;
          prevY = fingerY;
        } else {
          // 如果手指離開圓形，停止拖曳
          isDragging = false;
        }

        // 繪製食指尖端作為參考
        fill(255, 0, 0);
        noStroke();
        circle(fingerX, fingerY, 10);

        // Draw connections for each finger segment
        drawFingerConnections(hand, 0, 4);  // Thumb
        drawFingerConnections(hand, 5, 8);  // Index finger
        drawFingerConnections(hand, 9, 12); // Middle finger
        drawFingerConnections(hand, 13, 16); // Ring finger
        drawFingerConnections(hand, 17, 20); // Pinky finger

        // Draw keypoints as circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  } else {
    // 如果沒有手偵測到，停止拖曳
    isDragging = false;
  }
}

function drawFingerConnections(hand, startIdx, endIdx) {
  const keypoints = hand.keypoints;

  // Draw lines between consecutive keypoints in the specified range
  for (let i = startIdx; i < endIdx; i++) {
    const start = keypoints[i];
    const end = keypoints[i + 1];

    // Set stroke color based on handedness
    stroke(hand.handedness === "Left" ? [255, 0, 255] : [255, 255, 0]);
    strokeWeight(2);
    line(start.x, start.y, end.x, end.y);
  }
}
