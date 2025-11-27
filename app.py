from datetime import datetime
import os, json, io, base64
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
from PIL import Image

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# HOME ROUTE
@app.route("/")
def home():
    return render_template("index.html")

# OUTPUT DIRECTORY
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print("Loading Stable Diffusion model... Please wait ⏳")
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5", torch_dtype=dtype
).to(device)


@app.route("/generate", methods=["POST"])
def generate_image():
    data = request.json
    prompt = data.get("prompt", "")
    negative_prompt = data.get("negative_prompt", "")
    num_images = int(data.get("num_images", 1))
    style = data.get("style", "photorealistic")
    img_format = data.get("format", "png").lower()
    # ------------------- SAFTY FILTER -------------------
    blocked_words = ["nsfw", "nude", "naked", "violence", "blood", "sexual", "hate"]

    if any(word in prompt.lower() for word in blocked_words):
        return jsonify({"error": "⚠ Unsafe prompt detected. Please modify your text."}), 400
    # -----------------------------------------------------

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = os.path.join(OUTPUT_DIR, timestamp)
    os.makedirs(run_dir, exist_ok=True)

    generated_images = []

    for i in range(num_images):
        image = pipe(
            prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=40,
            guidance_scale=8
        ).images[0]

        filename = f"image_{i+1}.{img_format}"
        filepath = os.path.join(run_dir, filename)

        buffered = io.BytesIO()
        image.save(buffered, format=img_format.upper())
        img_bytes = buffered.getvalue()

        # SAVE TO DISK
        with open(filepath, "wb") as f:
            f.write(img_bytes)

        # BASE64 FOR UI
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        generated_images.append(img_base64)

        # METADATA FILE
        metadata = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "style": style,
            "timestamp": timestamp,
            "steps": 40,
            "guidance_scale": 8,
            "filename": filename
        }

        with open(os.path.join(run_dir, f"metadata_{i+1}.json"), "w") as f:
            json.dump(metadata, f, indent=4)

    return jsonify({"images": generated_images, "folder": timestamp})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
