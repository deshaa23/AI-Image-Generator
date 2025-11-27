# AI Text-to-Image Generator

This project generates AI-driven images from text prompts using Stable Diffusion. It includes a web interface where users can enter prompts, choose styles, adjust settings, and download generated images with watermarking.

---

## Features
- Generate images from text prompts
- Multiple styles (Realistic, Anime, Cartoon, Artistic, etc.)
- Adjustable number of images
- Negative prompts for corrections
- Real-time progress UI with loading animation
- Local GPU acceleration with CPU fallback
- Image storage with metadata (prompt, style, timestamp)
- Watermarked image downloads (Talrn watermark)
- Beautiful custom frontend interface

---

## Tech Stack
| Component | Technology |
|-----------|------------|
| Backend | Flask + PyTorch + Diffusers |
| Frontend | HTML + CSS + JavaScript |
| Model | Stable Diffusion v1.5 |
| Deployment | Local GPU execution |

---

## 📦 Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/deshaa23/AI-Image-Generator.git
cd ai-image-generator
