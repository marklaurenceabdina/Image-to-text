# Image Reader

A browser-based OCR app built with React + Vite that extracts text from uploaded images using PaddleOCR.

## Features
- Upload an image
- Extract text in the browser
- View OCR boxes and confidence scores
- Copy or download the extracted text
- Filipino/Tagalog OCR support

## Requirements
- Node.js 18 or newer
- npm
- A modern browser with internet access for the OCR model download

## Setup

1. Clone the repository
 ```bash
 git clone https://github.com/marklaurenceabdina/Image-to-text.git
 cd Image-to-text
 ```

2. Install dependencies
 ```bash
 npm install
 ```

3. Start the development server
 ```bash
 npm run dev
 ```

4. Open the local URL shown by Vite, usually:
 ```text
 http://localhost:5173
 ```

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview -- --host
```

## Notes
- The OCR model is downloaded at runtime in the browser, so the first run may take longer.
- The app is configured to use WebAssembly (`wasm`) and Tagalog (`lang: tl`).
- If OCR fails with a fetch error, make sure the browser has internet access and the app is running via the Vite dev server instead of opening the HTML file directly.
