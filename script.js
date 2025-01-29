const pickBtn = document.getElementById("pick-btn");
const fileInput = document.getElementById("file");
const image = document.getElementById("image");
const hexInput = document.getElementById("hex-input");
const rgbInput = document.getElementById("rgb-input");
const pickedColor = document.getElementById("picked-color");
const paletteContainer = document.getElementById("palette");

const colorDifferenceThreshold = 50; 

const initEyeDropper = () => {
    if ("EyeDropper" in window) {
        const eyeDropper = new EyeDropper();

        pickBtn.addEventListener("click", async () => {
            try {
                const colorValue = await eyeDropper.open();
                const hexValue = colorValue.sRGBHex.toLowerCase();
                const rgbValue = hexToRgb(hexValue);

                updateColorDisplays(hexValue, rgbValue);
            } catch (error) {
                console.error("EyeDropper error:", error);
                alert("Failed to pick color. Please try again.");
            }
        });
    } else {
        pickBtn.style.display = "none"; 
        alert("Your browser doesn't support the EyeDropper API.");
    }
};

const updateColorDisplays = (hexValue, rgbValue) => {
    hexInput.value = hexValue;
    rgbInput.value = rgbValue;
    pickedColor.style.backgroundColor = hexValue;
};

const rgbToHex = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
};

const colorDifference = (rgb1, rgb2) => {
    const [r1, g1, b1] = rgb1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = rgb2.match(/\d+/g).map(Number);
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
};

const extractColors = (img) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const uniqueColors = [];

    for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const rgb = `rgb(${r}, ${g}, ${b})`;

        if (
            !uniqueColors.some((c) => colorDifference(c, rgb) < colorDifferenceThreshold)
        ) {
            uniqueColors.push(rgb);
        }
    }

    return uniqueColors.slice(0, 10); // İlk 10 renk
};

const updatePalette = (colors) => {
    paletteContainer.innerHTML = "";
    colors.forEach((color) => {
        const colorDiv = document.createElement("div");
        colorDiv.className = "palette-color";
        colorDiv.style.backgroundColor = color;

        colorDiv.addEventListener("click", () => {
            const hex = rgbToHex(color);
            updateColorDisplays(hex, color);
        });

        paletteContainer.appendChild(colorDiv);
    });
};

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;

            image.onload = () => {
                const colors = extractColors(image);
                updatePalette(colors);
            };
        };
        reader.readAsDataURL(file);
    }
});

window.addEventListener("load", () => {
    console.log("App Loaded");
    initEyeDropper(); 
});

// Copy to clipboard function
const copyToClipboard = (id) => {
    const inputElement = document.getElementById(id);
    inputElement.select();
    document.execCommand('copy');
};
