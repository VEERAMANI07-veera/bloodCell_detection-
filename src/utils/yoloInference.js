const CLASS_NAMES = {
  0: 'WBC',
  1: 'RBC',
  2: 'Platelets'
};

const CLASS_COLORS = {
  WBC: '#ffffff',       // White
  RBC: '#ff4d4d',       // Red
  Platelets: '#ffd700'  // Yellow
};

let yoloSession = null;

// Load the ONNX model session
export async function loadYoloModel() {
  if (!yoloSession) {
    if (!window.ort) {
      throw new Error("ONNX Runtime is not loaded. Ensure CDN script is active.");
    }
    // Set wasm paths to load from the CDN for simplicity
    window.ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";
    yoloSession = await window.ort.InferenceSession.create('/best.onnx', {
      executionProviders: ['wasm']
    });
    console.log("YOLOv8 ONNX model loaded successfully.");
  }
  return yoloSession;
}

// Perform client-side YOLOv8 inference
export async function runYoloInference(imageFile) {
  // 1. Load the model session
  const session = await loadYoloModel();

  // 2. Read the image file and draw to canvas for preprocessing
  const img = await loadImage(imageFile);
  const origWidth = img.width;
  const origHeight = img.height;

  // Create offscreen canvas for 640x640 preprocessing
  const preprocessCanvas = document.createElement('canvas');
  preprocessCanvas.width = 640;
  preprocessCanvas.height = 640;
  const ctx = preprocessCanvas.getContext('2d');

  // Fill background with YOLOv8 default gray (114, 114, 114)
  ctx.fillStyle = '#727272';
  ctx.fillRect(0, 0, 640, 640);

  // Resize maintaining aspect ratio (letterboxing)
  const scale = Math.min(640 / origWidth, 640 / origHeight);
  const newWidth = origWidth * scale;
  const newHeight = origHeight * scale;
  const dx = (640 - newWidth) / 2;
  const dy = (640 - newHeight) / 2;
  ctx.drawImage(img, dx, dy, newWidth, newHeight);

  // Get image pixels
  const imgData = ctx.getImageData(0, 0, 640, 640);

  // 3. Preprocess pixels into Float32Array NCHW (1, 3, 640, 640)
  const float32Array = new Float32Array(3 * 640 * 640);
  const rOffset = 0;
  const gOffset = 640 * 640;
  const bOffset = 2 * 640 * 640;

  for (let i = 0; i < 640 * 640; i++) {
    // Normalize [0, 255] to [0, 1]
    float32Array[rOffset + i] = imgData.data[i * 4] / 255.0;     // Red
    float32Array[gOffset + i] = imgData.data[i * 4 + 1] / 255.0; // Green
    float32Array[bOffset + i] = imgData.data[i * 4 + 2] / 255.0; // Blue
  }

  // 4. Run inference
  const inputName = session.inputNames[0]; // e.g., 'images'
  const outputName = session.outputNames[0]; // e.g., 'output0'
  const inputTensor = new window.ort.Tensor('float32', float32Array, [1, 3, 640, 640]);

  const feeds = {};
  feeds[inputName] = inputTensor;
  const outputMap = await session.run(feeds);
  const output = outputMap[outputName].data; // Float32Array of size 7 * 8400

  // 5. Postprocess detections (Confidence Thresholding & Parse boxes)
  const candidates = [];
  const confidenceThreshold = 0.25;

  for (let boxIdx = 0; boxIdx < 8400; boxIdx++) {
    // Find class with highest confidence score
    let maxScore = -1;
    let maxClassId = -1;
    for (let classId = 0; classId < 3; classId++) {
      const score = output[(4 + classId) * 8400 + boxIdx];
      if (score > maxScore) {
        maxScore = score;
        maxClassId = classId;
      }
    }

    if (maxScore >= confidenceThreshold) {
      const xc = output[0 * 8400 + boxIdx];
      const yc = output[1 * 8400 + boxIdx];
      const w = output[2 * 8400 + boxIdx];
      const h = output[3 * 8400 + boxIdx];

      // Convert center coordinates to corners
      const x1 = xc - w / 2;
      const y1 = yc - h / 2;
      const x2 = xc + w / 2;
      const y2 = yc + h / 2;

      candidates.push({
        bbox: [x1, y1, x2, y2],
        confidence: maxScore,
        classId: maxClassId,
        class: CLASS_NAMES[maxClassId]
      });
    }
  }

  // 6. Apply Non-Maximum Suppression (NMS)
  const selectedDetections = applyNMS(candidates, 0.45);

  // 7. Scale coordinates back to original image scale
  const finalDetections = selectedDetections.map((d, idx) => {
    let [x1, y1, x2, y2] = d.bbox;

    // Remove letterbox offsets and divide by scale
    x1 = Math.max(0, Math.round((x1 - dx) / scale));
    y1 = Math.max(0, Math.round((y1 - dy) / scale));
    x2 = Math.min(origWidth, Math.round((x2 - dx) / scale));
    y2 = Math.min(origHeight, Math.round((y2 - dy) / scale));

    return {
      id: idx + 1,
      class: d.class,
      confidence: parseFloat(d.confidence.toFixed(4)),
      bbox: [x1, y1, x2, y2]
    };
  });

  // 8. Draw bounding boxes on original image
  const annotatedDataUrl = drawBoundingBoxes(img, finalDetections);

  // 9. Compute summaries matching backend schema
  const counts = { RBC: 0, WBC: 0, Platelets: 0 };
  const confidenceSums = { RBC: 0, WBC: 0, Platelets: 0 };

  finalDetections.forEach(d => {
    if (counts.hasOwnProperty(d.class)) {
      counts[d.class]++;
      confidenceSums[d.class] += d.confidence;
    }
  });

  const avgConfidence = {};
  const percentages = {};
  const totalCells = finalDetections.length;

  for (let cls in counts) {
    avgConfidence[cls] = counts[cls] > 0 ? parseFloat((confidenceSums[cls] / counts[cls]).toFixed(4)) : 0.0;
    percentages[cls] = totalCells > 0 ? parseFloat(((counts[cls] / totalCells) * 100).toFixed(2)) : 0.0;
  }

  // Find dominant class
  let highestDetected = "None";
  let maxCount = -1;
  for (let cls in counts) {
    if (counts[cls] > maxCount) {
      maxCount = counts[cls];
      highestDetected = cls;
    }
  }
  if (totalCells === 0) highestDetected = "None";

  const overallConf = totalCells > 0
    ? parseFloat((finalDetections.reduce((sum, d) => sum + d.confidence, 0) / totalCells).toFixed(4))
    : 0.0;

  return {
    success: true,
    image_url: annotatedDataUrl,
    total_cells: totalCells,
    counts,
    average_confidence: avgConfidence,
    percentages,
    highest_detected: highestDetected,
    overall_average_confidence: overallConf,
    detections: finalDetections
  };
}

// Helper to load image asynchronously
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image element."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

// Calculate Intersection over Union
function calculateIoU(box1, box2) {
  const x1 = Math.max(box1[0], box2[0]);
  const y1 = Math.max(box1[1], box2[1]);
  const x2 = Math.min(box1[2], box2[2]);
  const y2 = Math.min(box1[3], box2[3]);

  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (intersectionArea === 0) return 0;

  const box1Area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
  const box2Area = (box2[2] - box2[0]) * (box2[3] - box2[1]);
  const unionArea = box1Area + box2Area - intersectionArea;

  return intersectionArea / unionArea;
}

// Apply standard Non-Maximum Suppression (NMS)
function applyNMS(candidates, iouThreshold) {
  candidates.sort((a, b) => b.confidence - a.confidence);

  const selected = [];
  const active = new Array(candidates.length).fill(true);

  for (let i = 0; i < candidates.length; i++) {
    if (!active[i]) continue;

    const boxA = candidates[i];
    selected.push(boxA);

    for (let j = i + 1; j < candidates.length; j++) {
      if (!active[j]) continue;

      const boxB = candidates[j];
      const iou = calculateIoU(boxA.bbox, boxB.bbox);

      if (iou > iouThreshold) {
        active[j] = false;
      }
    }
  }
  return selected;
}

// Draw annotated boxes onto original image and output Data URL
function drawBoundingBoxes(img, detections) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Styling properties
  const lineWidth = Math.max(2, Math.round(img.width / 400));
  const fontSize = Math.max(12, Math.round(img.width / 50));
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';

  detections.forEach(d => {
    const [x1, y1, x2, y2] = d.bbox;
    const color = CLASS_COLORS[d.class] || '#00ff00';

    // Draw box
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    // Draw label background
    const label = `${d.class} ${(d.confidence * 100).toFixed(0)}%`;
    const textWidth = ctx.measureText(label).width;
    const labelPadding = 4;
    const labelHeight = fontSize + labelPadding * 2;

    ctx.fillStyle = color;
    // Handle top-edge labeling (draw label inside the box if it overflows the top edge)
    const labelY = y1 - labelHeight >= 0 ? y1 - labelHeight : y1;
    ctx.fillRect(x1, labelY, textWidth + labelPadding * 2, labelHeight);

    // Draw label text
    ctx.fillStyle = d.class === 'WBC' ? '#000000' : '#ffffff'; // Dark text on white, light on colors
    ctx.fillText(label, x1 + labelPadding, labelY + labelPadding);
  });

  return canvas.toDataURL('image/jpeg', 0.85);
}
