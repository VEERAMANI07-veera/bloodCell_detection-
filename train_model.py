import os
import zipfile
import shutil
import json
from ultralytics import YOLO

def setup_dataset():
    print("Extracting dataset...")
    if not os.path.exists("train") or not os.path.exists("val"):
        with zipfile.ZipFile("archive (8).zip", "r") as zip_ref:
            zip_ref.extractall(".")
    
    print("Restructuring folders for YOLO...")
    os.makedirs("dataset", exist_ok=True)
    splits = ["train", "val", "test"]
    for split in splits:
        os.makedirs(f"dataset/{split}/images", exist_ok=True)
        os.makedirs(f"dataset/{split}/labels", exist_ok=True)
        
        src_img = f"{split}/img"
        dst_img = f"dataset/{split}/images"
        if os.path.exists(src_img):
            for f in os.listdir(src_img):
                shutil.move(os.path.join(src_img, f), os.path.join(dst_img, f))
                
        src_ann = f"{split}/ann"
        dst_ann = f"dataset/{split}/labels"
        if os.path.exists(src_ann):
            for f in os.listdir(src_ann):
                shutil.move(os.path.join(src_ann, f), os.path.join(dst_ann, f))

    # Helper for converting json to yolo txt
    class_map = {"WBC": 0, "RBC": 1, "Platelets": 2}
    
    def convert_json_to_yolo(json_path):
        with open(json_path) as f:
            data = json.load(f)
        
        # Determine image dimensions from json or guess
        img_w = data.get("imageWidth", 640)
        img_h = data.get("imageHeight", 480)
        
        labels = []
        if "objects" in data:
            for obj in data["objects"]:
                cls_name = obj.get("classTitle", "")
                if cls_name not in class_map: continue
                cls = class_map[cls_name]
                
                points = obj["points"]["exterior"]
                (x1, y1) = points[0]
                (x2, y2) = points[1]
                
                xc = ((x1 + x2) / 2) / img_w
                yc = ((y1 + y2) / 2) / img_h
                w = abs(x2 - x1) / img_w
                h = abs(y2 - y1) / img_h
                labels.append(f"{cls} {xc} {yc} {w} {h}")
        return labels

    print("Converting annotations to YOLO format...")
    for split in splits:
        label_dir = f"dataset/{split}/labels"
        if not os.path.exists(label_dir): continue
        for json_filename in os.listdir(label_dir):
            if not json_filename.endswith(".json"): continue
            
            json_filepath = os.path.join(label_dir, json_filename)
            txt_filename = json_filename.replace(".jpeg.json", ".txt").replace(".json", ".txt")
            txt_filepath = os.path.join(label_dir, txt_filename)
            
            yolo_labels = convert_json_to_yolo(json_filepath)
            with open(txt_filepath, "w") as f:
                f.write("\n".join(yolo_labels) + "\n")
            
            os.remove(json_filepath)

    print("Creating data.yaml...")
    yaml_content = f"""path: {os.path.abspath('dataset')}
train: train/images
val: val/images
test: test/images

nc: 3
names:
  0: WBC
  1: RBC
  2: Platelets
"""
    with open("data.yaml", "w") as f:
        f.write(yaml_content)

if __name__ == "__main__":
    if not os.path.exists("dataset"):
        setup_dataset()
    else:
        print("Dataset already setup.")
        
    print("Starting YOLO training with a larger model for better accuracy...")
    model = YOLO("yolov8s.pt")  # Using 'small' model instead of 'nano' for better accuracy
    
    print("Training the model...")
    results = model.train(
        data="data.yaml",
        epochs=50,  # Increased epochs for better learning
        imgsz=640,
        batch=4,
        project="Blood_Cell_Detection",
        name="YOLOv8s_BCCD",
        exist_ok=True
    )
    
    print("Training finished! Copying best.pt to backend folder...")
    best_pt_path = os.path.join("runs", "detect", "Blood_Cell_Detection", "YOLOv8s_BCCD", "weights", "best.pt")
    target_path = os.path.join("backend", "best.pt")
    if os.path.exists(best_pt_path):
        shutil.copy(best_pt_path, target_path)
        print(f"Successfully copied {best_pt_path} to {target_path}")
    else:
        print(f"Error: {best_pt_path} not found.")
