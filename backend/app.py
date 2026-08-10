import os
import uuid
import numpy as np
import cv2
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import traceback

app = Flask(__name__)
# Enable CORS for the frontend
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Try loading the model globally
MODEL_PATH = 'best.pt'
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print("Model loaded successfully.")
    else:
        print(f"Warning: Model file {MODEL_PATH} not found. Please place it in the backend directory.")
except Exception as e:
    print(f"Error loading model: {e}")

# Classes based on requirement
# 0 = WBC, 1 = RBC, 2 = Platelets
CLASS_NAMES = {
    0: "WBC",
    1: "RBC",
    2: "Platelets"
}

# Colors for bounding boxes (B, G, R)
CLASS_COLORS = {
    0: (255, 255, 255), # WBC: White
    1: (0, 0, 255),     # RBC: Red
    2: (0, 255, 255)    # Platelets: Yellow
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def index():
    status = "running"
    model_status = "loaded" if model is not None else "missing"
    return jsonify({"status": status, "model": model_status, "message": "Blood Cell Detection API is active."})

@app.route('/api/predict', methods=['POST'])
def predict():
    global model
    if model is None:
        try:
            if os.path.exists(MODEL_PATH):
                model = YOLO(MODEL_PATH)
                print("Model loaded successfully on demand.")
            else:
                return jsonify({"success": False, "error": "Model not loaded. Please ensure best.pt is present."}), 500
        except Exception as e:
            return jsonify({"success": False, "error": f"Error loading model: {e}"}), 500

    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image uploaded."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected image."}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "Invalid file format. Allowed formats are png, jpg, jpeg, webp."}), 400

    try:
        # Secure filename and save
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = f"{unique_id}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
        file.save(filepath)

        # Run inference
        results = model(filepath)
        
        # Read image to draw bounding boxes
        img = cv2.imread(filepath)
        if img is None:
            return jsonify({"success": False, "error": "Failed to read the image file."}), 500
            
        # Run inference using the exact settings from the original notebook
        results = model.predict(source=filepath, conf=0.25)
        
        detections = []
        counts = {"RBC": 0, "WBC": 0, "Platelets": 0}
        confidence_sums = {"RBC": 0.0, "WBC": 0.0, "Platelets": 0.0}

        # Process results
        for r in results:
            boxes = r.boxes
            for i, box in enumerate(boxes):
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = CLASS_NAMES.get(cls_id, "Unknown")
                
                if class_name in counts:
                    counts[class_name] += 1
                    confidence_sums[class_name] += conf
                
                # Get bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                detections.append({
                    "id": i + 1,
                    "class": class_name,
                    "confidence": round(conf, 4),
                    "bbox": [x1, y1, x2, y2]
                })

                # Draw bounding box
                color = CLASS_COLORS.get(cls_id, (0, 255, 0))
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                # Draw label
                label = f"{class_name} {conf:.2f}"
                cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Save annotated image
        result_filename = f"result_{safe_filename}"
        result_filepath = os.path.join(RESULTS_FOLDER, result_filename)
        cv2.imwrite(result_filepath, img)

        total_cells = len(detections)
        avg_confidence = {}
        for cls_name in counts:
            if counts[cls_name] > 0:
                avg_confidence[cls_name] = round(confidence_sums[cls_name] / counts[cls_name], 4)
            else:
                avg_confidence[cls_name] = 0.0

        percentages = {}
        if total_cells > 0:
            for cls_name in counts:
                percentages[cls_name] = round((counts[cls_name] / total_cells) * 100, 2)
        else:
            percentages = {"RBC": 0.0, "WBC": 0.0, "Platelets": 0.0}

        highest_detected = max(counts, key=counts.get) if total_cells > 0 else "None"
        overall_conf = round(sum(d['confidence'] for d in detections) / total_cells, 4) if total_cells > 0 else 0.0

        response = {
            "success": True,
            "image_url": f"/results/{result_filename}",
            "total_cells": total_cells,
            "counts": counts,
            "average_confidence": avg_confidence,
            "percentages": percentages,
            "highest_detected": highest_detected,
            "overall_average_confidence": overall_conf,
            "detections": detections
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error during prediction: {traceback.format_exc()}")
        return jsonify({"success": False, "error": "An error occurred during prediction."}), 500

@app.route('/results/<filename>', methods=['GET'])
def get_result_image(filename):
    return send_from_directory(RESULTS_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
