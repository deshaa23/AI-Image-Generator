async function generateImages() {
    const prompt = document.getElementById('promptInput').value.trim();
    const negativePrompt = document.getElementById('negativePrompt').value.trim();
    const numImages = parseInt(document.getElementById('numImages').value);
    const style = document.getElementById('styleSelect').value;

    if (!prompt) {
        alert("Please enter a prompt!");
        return;
    }

    // STYLE PROMPT MAPPING
    const styleKeywords = {
        "photorealistic": "photo realistic, DSLR, bokeh, ultra detailed, cinematic lighting, 4k",
        "artistic": "fine art, brush strokes, detailed texture",
        "cartoon": "pixar style, cartoon, soft shading, colorful",
        "anime": "anime style, sharp lines, vivid colors, studio ghibli aesthetic",
        "3d": "3d render, octane render, ray tracing, realistic shadows",
        "oil-painting": "oil painting, canvas texture, thick brush strokes",
        "watercolor": "watercolor, soft bleed edges, natural pigments",
        "cyberpunk": "cyberpunk neon lighting, futuristic, rain reflections"
    };

    const stylePrompt = styleKeywords[style] || "";

    document.getElementById('loadingState').classList.add('active');
    document.getElementById('emptyState').style.display = 'none';

    // REMOVE OLD IMAGES WHEN NEW PROMPT IS TRIGGERED
    document.getElementById('imageGrid').innerHTML = "";

    try {
        const response = await fetch("http://127.0.0.1:5000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `${prompt}, ${stylePrompt}, ultra high resolution, extremely detailed`,
                negative_prompt: negativePrompt,
                num_images: numImages,
                style: style
            })
        });

        const data = await response.json();
        document.getElementById('loadingState').classList.remove('active');

        if (data.images) {
            data.images.forEach((img64) => {
                addImageToGallery(img64, prompt, style);
            });
        }

    } catch (error) {
        console.error(error);
        alert("Error generating image");
        document.getElementById('loadingState').classList.remove('active');
    }
}

function addImageToGallery(imageData, prompt, style) {
    const imageGrid = document.getElementById('imageGrid');
    const imageCard = document.createElement("div");
    imageCard.className = "image-card";

    imageCard.innerHTML = `
        <img src="data:image/png;base64,${imageData}" alt="Generated">
        <div class="image-info">
            <div class="prompt-text">${prompt} (${style})</div>
        </div>
        <button class="action-btn download-btn" onclick="downloadImage('${imageData}')">Download</button>

    `;

    imageGrid.insertBefore(imageCard, imageGrid.firstChild);
}
async function downloadImage(imageData) {
    const response = await fetch("http://127.0.0.1:5000/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    });

    const result = await response.json();
    const link = document.createElement("a");
    link.href = "data:image/png;base64," + result.image;
    link.download = "Talrn_image.png";
    link.click();
}

