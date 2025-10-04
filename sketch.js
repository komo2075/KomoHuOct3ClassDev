// ==============================================
// DEBUG BUILD — shows why the screen is black
// Long-press = play forward; release = play backward
// Frames named: assets/frames/frame_0001.png ... frame_0019.png
// ==============================================

const NUM_FRAMES = 19;
const FRAME_DIR  = 'assets/frames/';   // <-- 确认你的真实路径
const FRAME_PREF = 'frame_';
const FRAME_PAD  = 4;
const EXT        = 'png';

const FWD_SPEED  = 0.75;
const BWD_SPEED  = 0.75;

let frames = [];
let loadedCount = 0;
let frameIndex = 0;
let isTouching = false;
let failedPaths = [];                  // 记录加载失败的路径
let firstSuccessPath = null;

function preload() {
  for (let i = 1; i <= NUM_FRAMES; i++) {
    const id = String(i).padStart(FRAME_PAD, '0'); // 0001..0019
    const path = `${FRAME_DIR}${FRAME_PREF}${id}.${EXT}`;
    // 带失败回调：能看见是哪个路径 404
    loadImage(
      path,
      (img) => {
        frames[i - 1] = img;
        loadedCount++;
        firstSuccessPath = firstSuccessPath || path;
        console.log('[OK ] loaded', path);
      },
      (err) => {
        failedPaths.push(path);
        console.warn('[FAIL] cannot load', path, err);
      }
    );
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (typeof lockGestures === 'function') lockGestures();
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(16);
  frameRate(60);
}

function draw() {
  background(0);

  // 顶部调试信息
  drawDebugBanner();

  // 还没加载好：显示详细诊断
  if (loadedCount < NUM_FRAMES) {
    fill(255);
    textSize(18);
    text(`Loading ${loadedCount}/${NUM_FRAMES}…`, width/2, height/2 - 10);
    textSize(14);
    text(
      `Expecting: ${FRAME_DIR}${FRAME_PREF}${String(1).padStart(FRAME_PAD,'0')}.${EXT} ...`,
      width/2, height/2 + 18
    );

    if (failedPaths.length > 0) {
      // 显示第1个失败样本，避免遮挡太多
      drawFailBox();
    }
    return;
  }

  // 全部加载成功才播放
  frameIndex = isTouching
    ? min(frameIndex + FWD_SPEED, NUM_FRAMES - 1)
    : max(frameIndex - BWD_SPEED, 0);

  const idx = Math.round(frameIndex);
  const img = frames[idx];

  // 适配屏幕
  const scale = min((width*0.92)/img.width, (height*0.92)/img.height);
  image(img, width/2, height/2, img.width*scale, img.height*scale);

  // 底部提示
  drawHUD(idx);
}

function drawDebugBanner() {
  push();
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, 64);
  fill(255);
  textSize(12);
  text(
    `Canvas: ${width}×${height} | Loaded: ${loadedCount}/${NUM_FRAMES} | Fail: ${failedPaths.length}`,
    width/2, 20
  );
  text(
    `DIR="${FRAME_DIR}"  PREFIX="${FRAME_PREF}"  PAD=${FRAME_PAD}  EXT="${EXT}"`,
    width/2, 44
  );
  pop();
}

function drawFailBox() {
  push();
  const sample = failedPaths[0];
  fill(180, 0, 0, 160);
  rect(width*0.05, height*0.65, width*0.9, height*0.25, 12);
  fill(255);
  textSize(14);
  text('Some frames failed to load. First missing path:', width/2, height*0.69);
  textSize(12);
  text(sample, width/2, height*0.72);
  text('Check folder name / prefix / zero padding / extension / case.', width/2, height*0.76);
  pop();
}

function drawHUD(idx) {
  push();
  noStroke();
  fill(0, 0, 0, 120);
  rect(0, height - 64, width, 64);
  fill(255);
  const modeText = isTouching ? 'FORWARD (hold)' : 'REVERSE (release)';
  text(`${modeText} • frame ${idx + 1}/${NUM_FRAMES}`, width / 2, height - 32);
  pop();
}

function touchStarted(){ isTouching = true; return false; }
function touchEnded(){ isTouching = false; return false; }
function mousePressed(){ isTouching = true; }
function mouseReleased(){ isTouching = false; }
function windowResized(){ resizeCanvas(windowWidth, windowHeight); }
