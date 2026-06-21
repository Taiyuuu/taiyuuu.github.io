const imageFormats = ['png', 'jpg', 'gif', 'tiff', 'svg', 'webp', 'ico', 'icns', 'avif', 'raw'];
const imageFormatsFrom = ['html', ...imageFormats];
const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'gif', 'webm'];
const audioFormats = ['mp3', 'm4a', 'ogg', 'wma', 'wav', 'aac'];

// DOM Elements
const fileInput = document.getElementById('file-input');
const fileArea = document.getElementById('file-area');
const fileNameDisplay = document.getElementById('file-name');
const fromList = document.getElementById('from-list');
const toList = document.getElementById('to-list');
const convertBtn = document.getElementById('convert-button');
const resetBtn = document.getElementById('reset-button');
const homeBtn = document.getElementById('home-button');
const settingsBtn = document.getElementById('settings-btn');
const htmlDirBtn = document.getElementById('html-dir-btn');
const multiFileBtn = document.getElementById('multi-file-btn');
const popupBg = document.getElementById('popup-bg');
const popup = document.getElementById('popup');
const searchInputs = document.querySelectorAll('.search');
const showFormatsBtn = document.getElementById('show-formats-btn');
const showVideoFormatsBtn = document.getElementById('show-video-formats-btn');
const showAudioFormatsBtn = document.getElementById('show-audio-formats-btn');
const showImgToVidBtn = document.getElementById('show-img-to-vid-btn');
const showVidToImgBtn = document.getElementById('show-vid-to-img-btn');
const showVidToAudBtn = document.getElementById('show-vid-to-aud-btn');
const showAudToImgBtn = document.getElementById('show-aud-to-img-btn');
const showImgToAudBtn = document.getElementById('show-img-to-aud-btn');
const introContainer = document.getElementById('intro-container');
const formatContainers = document.getElementById('format-containers');
const settingsContainer = document.getElementById('settings-container');
const svgScaleInput = document.getElementById('svg-scale-input');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const vidToImgSettings = document.getElementById('vid-to-img-settings');
const singleFrameBtn = document.getElementById('single-frame-btn');
const everyFrameBtn = document.getElementById('every-frame-btn');
const singleFramePreview = document.getElementById('single-frame-preview');
const videoPreview = document.getElementById('video-preview');
const setDirBtn = document.getElementById('set-dir-btn');
const dirStatus = document.getElementById('dir-status');
const previewSizeSlider = document.getElementById('preview-size');
const imgToVidSettings = document.getElementById('img-to-vid-settings');
const fpsInput = document.getElementById('fps-input');
const timePerFrameInput = document.getElementById('time-per-frame-input');
const totalTimeInput = document.getElementById('total-time-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const visSpectrogram = document.getElementById('vis-spectrogram');

// State
let currentFiles = [];
let selectedFrom = null;
let selectedTo = null;
let currentMode = 'image'; // 'image' or 'video'
let videoToImageConfig = 'single'; // 'single' or 'every'
let downloadDirHandle = null;
let imagePreviewInterval = null;

// Initialize
function init() {
    renderFormatList(fromList, 'from', imageFormats);
    renderFormatList(toList, 'to', imageFormats);
    setupEventListeners();
}

function renderFormatList(container, type, formatList) {
    container.innerHTML = '';
    formatList.forEach(fmt => {
        const btn = document.createElement('button');
        btn.textContent = fmt.toUpperCase();
        btn.dataset.format = fmt;
        btn.onclick = () => selectFormat(type, fmt, btn);
        container.appendChild(btn);
    });
}

function setupEventListeners() {
    // File Input
    fileArea.addEventListener('click', () => {
        fileInput.click(); // 'multiple' attribute is now handled by mode switchers
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Drag & Drop
    fileArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileArea.style.opacity = '0.7';
    });
    fileArea.addEventListener('dragleave', () => {
        fileArea.style.opacity = '1';
    });
    fileArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileArea.style.opacity = '1';
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // Search
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const list = e.target.closest('.format-container').querySelector('.format-list');
            Array.from(list.children).forEach(btn => {
                const fmt = btn.dataset.format;
                btn.style.display = fmt.includes(term) ? 'block' : 'none';
            });
        });
    });

    // Reset
    resetBtn.addEventListener('click', resetUI);

    // Convert
    convertBtn.addEventListener('click', convertImage);

    // Popup Close (Clicking background)
    popupBg.addEventListener('click', closePopup);

    // Show Formats
    showFormatsBtn.addEventListener('click', () => {
        currentMode = 'image';
        renderFormatList(fromList, 'from', imageFormatsFrom);
        renderFormatList(toList, 'to', imageFormats);
        fileInput.accept = 'image/*';
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = '';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    showVideoFormatsBtn.addEventListener('click', () => {
        currentMode = 'video';
        renderFormatList(fromList, 'from', videoFormats);
        renderFormatList(toList, 'to', videoFormats);
        fileInput.accept = 'video/*, .mkv, .avi, .mov';
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = '';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    showAudioFormatsBtn.addEventListener('click', () => {
        currentMode = 'audio';
        renderFormatList(fromList, 'from', audioFormats);
        renderFormatList(toList, 'to', audioFormats);
        fileInput.accept = 'audio/*';
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = '';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    showImgToVidBtn.addEventListener('click', () => {
        currentMode = 'images-to-video';
        renderFormatList(fromList, 'from', imageFormats);
        renderFormatList(toList, 'to', videoFormats);
        fileInput.accept = 'image/*';
        fileInput.setAttribute('multiple', '');
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = 'none';
        imgToVidSettings.style.display = '';
        vidToImgSettings.style.display = 'none';
    });

    showVidToImgBtn.addEventListener('click', () => {
        currentMode = 'video-to-images';
        renderFormatList(fromList, 'from', videoFormats);
        renderFormatList(toList, 'to', imageFormats);
        fileInput.accept = 'video/*, .mkv, .avi, .mov';
        fileInput.removeAttribute('multiple');
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = 'none';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = '';
        updateVidToImgButtons();
        if (currentFiles.length > 0) {
            videoPreview.src = URL.createObjectURL(currentFiles[0]);
        }
    });

    showVidToAudBtn.addEventListener('click', () => {
        currentMode = 'video-to-audio';
        renderFormatList(fromList, 'from', videoFormats);
        renderFormatList(toList, 'to', audioFormats);
        fileInput.accept = 'video/*, .mkv, .avi, .mov';
        fileInput.removeAttribute('multiple');
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = '';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    showAudToImgBtn.addEventListener('click', () => {
        currentMode = 'audio-to-image';
        renderFormatList(fromList, 'from', audioFormats);
        renderFormatList(toList, 'to', imageFormats);
        fileInput.accept = 'audio/*, .wma, .m4a';
        fileInput.removeAttribute('multiple');
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = 'none';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    showImgToAudBtn.addEventListener('click', () => {
        currentMode = 'image-to-audio';
        renderFormatList(fromList, 'from', imageFormats);
        renderFormatList(toList, 'to', audioFormats);
        fileInput.accept = 'image/*';
        fileInput.removeAttribute('multiple');
        formatContainers.style.display = '';
        convertBtn.style.display = '';
        introContainer.style.display = 'none';
        homeBtn.style.display = '';
        multiFileBtn.style.display = 'none';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    // Home Button
    homeBtn.addEventListener('click', () => {
        formatContainers.style.display = 'none';
        convertBtn.style.display = 'none';
        introContainer.style.display = 'flex';
        settingsContainer.style.display = 'none';
        homeBtn.style.display = 'none';
        multiFileBtn.style.display = 'none';
        imgToVidSettings.style.display = 'none';
        vidToImgSettings.style.display = 'none';
    });

    // Settings Button
    settingsBtn.addEventListener('click', () => {
        if (settingsContainer.style.display === 'none') {
            settingsContainer.style.display = 'block';
        } else {
            settingsContainer.style.display = 'none';
        }
    });

    // HTML Directory Button
    htmlDirBtn.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                const files = await getFilesFromDirectory(dirHandle);
                
                showFormatsBtn.click(); // Switch to image view
                handleFiles(files);
            } catch (err) {
                console.error(err);
            }
        } else {
            alert('Directory selection is not supported in this browser.');
        }
    });

    // Close Settings Button
    closeSettingsBtn.addEventListener('click', () => {
        settingsContainer.style.display = 'none';
    });

    // Multi File Button
    multiFileBtn.addEventListener('click', () => {
        fileInput.setAttribute('multiple', '');
        fileInput.click();
    });

    // Video to Image Settings Buttons
    singleFrameBtn.addEventListener('click', () => {
        videoToImageConfig = 'single';
        updateVidToImgButtons();
    });
    everyFrameBtn.addEventListener('click', () => {
        videoToImageConfig = 'every';
        updateVidToImgButtons();
    });

    // Set Download Directory
    setDirBtn.addEventListener('click', async () => {
        if ('showDirectoryPicker' in window) {
            try {
                downloadDirHandle = await window.showDirectoryPicker();
                dirStatus.textContent = `Selected: ${downloadDirHandle.name}`;
            } catch (err) {
                console.error(err);
            }
        } else {
            alert('Directory selection is not supported in this browser.');
        }
    });

    // Preview Size Slider
    previewSizeSlider.addEventListener('input', () => {
        videoPreview.style.width = `${previewSizeSlider.value}%`;
    });

    // Images to Video settings listeners
    fpsInput.addEventListener('input', () => {
        const fps = parseFloat(fpsInput.value) || 1;
        const timePerFrame = 1 / fps;
        timePerFrameInput.value = timePerFrame.toFixed(4);
        updateTotalTime();
        startImagePreview();
    });
    timePerFrameInput.addEventListener('input', () => {
        const timePerFrame = parseFloat(timePerFrameInput.value) || 0.01;
        const fps = 1 / timePerFrame;
        fpsInput.value = fps.toFixed(2);
        updateTotalTime();
        startImagePreview();
    });
}

async function getFilesFromDirectory(dirHandle) {
    const files = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            files.push(await entry.getFile());
        } else if (entry.kind === 'directory') {
            files.push(...await getFilesFromDirectory(entry));
        }
    }
    return files;
}

function updateTotalTime() {
    if (currentMode === 'images-to-video' && currentFiles.length > 0) {
        const timePerFrame = parseFloat(timePerFrameInput.value) || 0;
        const totalTime = currentFiles.length * timePerFrame;
        totalTimeInput.value = totalTime.toFixed(2);
    } else {
        totalTimeInput.value = '';
    }
}

function startImagePreview() {
    if (imagePreviewInterval) clearInterval(imagePreviewInterval);
    if (currentMode !== 'images-to-video' || currentFiles.length === 0) {
        imagePreviewContainer.style.display = 'none';
        return;
    }

    imagePreviewContainer.style.display = 'block';
    let currentIndex = 0;
    const timePerFrame = (parseFloat(timePerFrameInput.value) || 1) * 1000;

    const showNextImage = () => {
        imagePreview.src = URL.createObjectURL(currentFiles[currentIndex]);
        currentIndex = (currentIndex + 1) % currentFiles.length;
    };

    showNextImage(); // Show first image immediately
    if (currentFiles.length > 1) {
        imagePreviewInterval = setInterval(showNextImage, timePerFrame);
    }
}

function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    currentFiles = Array.from(files);
    
    // Validate types
    let isValid = false;
    if (currentMode === 'image') {
        const hasHtml = currentFiles.some(f => f.type === 'text/html' || f.name.endsWith('.html'));
        isValid = hasHtml ? true : currentFiles.every(f => f.type.startsWith('image/'));
    } else if (currentMode === 'images-to-video') {
        isValid = currentFiles.every(f => f.type.startsWith('image/'));
    } else if (currentMode === 'image-to-audio') {
        isValid = currentFiles.every(f => f.type.startsWith('image/'));
    } else if (currentMode === 'video' || currentMode === 'video-to-images' || currentMode === 'video-to-audio') {
        isValid = currentFiles.every(f => f.type.startsWith('video/') || f.name.endsWith('.mkv') || f.name.endsWith('.avi') || f.name.endsWith('.mov'));
    } else if (currentMode === 'audio' || currentMode === 'audio-to-image') {
        isValid = currentFiles.every(f => f.type.startsWith('audio/') || f.name.endsWith('.wma') || f.name.endsWith('.m4a'));
    }
    
    if (!isValid) {
        alert(`Please upload only ${currentMode} files.`);
        currentFiles = [];
        return;
    }

    if (currentFiles.length === 1) {
        fileNameDisplay.textContent = currentFiles[0].name;
    } else {
        fileNameDisplay.textContent = `${currentFiles.length} files selected`;
    }
    
    // Detect format (check if all are same)
    const firstExt = currentFiles[0].name.split('.').pop().toLowerCase();
    const allSame = currentFiles.every(f => f.name.split('.').pop().toLowerCase() === firstExt);
    
    const extension = allSame ? firstExt : null;
    let currentFormats = imageFormats;
    if (currentMode === 'audio' || currentMode === 'audio-to-image') currentFormats = audioFormats;
    else if (currentMode === 'video' || currentMode.startsWith('video-')) currentFormats = videoFormats;
    else if (currentMode === 'image-to-audio') currentFormats = imageFormats;
    else if (currentMode === 'image') currentFormats = imageFormatsFrom;
    const detected = currentFormats.includes(extension) ? extension : null;

    // Auto-select 'From'
    if (detected) {
        const btn = Array.from(fromList.children).find(b => b.dataset.format === detected);
        if (btn) selectFormat('from', detected, btn);
    }

    if (currentMode === 'video-to-images' && currentFiles.length > 0) {
        videoPreview.src = URL.createObjectURL(currentFiles[0]);
    }

    if (currentMode === 'images-to-video') {
        updateTotalTime();
        startImagePreview();
    }

    updateConvertButton();
}

function selectFormat(type, fmt, btnElement) {
    const container = type === 'from' ? fromList : toList;
    
    // Remove previous selection
    Array.from(container.children).forEach(b => b.classList.remove('selected'));
    
    // Set new selection
    btnElement.classList.add('selected');
    
    if (type === 'from') selectedFrom = fmt;
    else selectedTo = fmt;

    updateConvertButton();
}

function updateConvertButton() {
    if (currentFiles.length > 0 && selectedFrom && selectedTo) {
        convertBtn.classList.remove('disabled');
    } else {
        convertBtn.classList.add('disabled');
    }
}

function resetUI() {
    currentFiles = [];
    selectedFrom = null;
    selectedTo = null;
    fileInput.value = '';
    fileNameDisplay.textContent = '';
    
    document.querySelectorAll('.format-list button').forEach(b => b.classList.remove('selected'));
    convertBtn.classList.add('disabled');
    closePopup();
    videoPreview.src = '';
    videoPreview.load();
    if (imagePreviewInterval) clearInterval(imagePreviewInterval);
    imagePreviewInterval = null;
    imagePreview.src = '';
    imagePreviewContainer.style.display = 'none';
}

function showPopup(content) {
    popup.innerHTML = '';
    popup.appendChild(content);
    popupBg.style.display = 'block';
    popup.style.display = 'block';
    popup.style.width = ''; // Reset width to CSS default
}

function closePopup() {
    popupBg.style.display = 'none';
    popup.style.display = 'none';
}

function updateVidToImgButtons() {
    if (videoToImageConfig === 'single') {
        singleFrameBtn.style.backgroundColor = 'var(--highlight-color)';
        singleFrameBtn.style.color = '#fff';
        everyFrameBtn.style.backgroundColor = '#d3d3d3';
        everyFrameBtn.style.color = '#000';
        singleFramePreview.style.display = 'block';
    } else {
        singleFrameBtn.style.backgroundColor = '#d3d3d3';
        singleFrameBtn.style.color = '#000';
        everyFrameBtn.style.backgroundColor = 'var(--highlight-color)';
        everyFrameBtn.style.color = '#fff';
        singleFramePreview.style.display = 'none';
    }
}

async function convertImage() {
    if (currentFiles.length === 0) return;

    // Show loading state
    const loadingMsg = document.createElement('h2');
    loadingMsg.textContent = 'Converting...';
    showPopup(loadingMsg);

    try {
        let results = [];

        if (currentMode === 'images-to-video') {
            if (currentFiles.length === 0) return;
            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({ log: true });
            loadingMsg.textContent = 'Loading FFmpeg Core...';
            await ffmpeg.load();
            loadingMsg.textContent = 'Processing Images...';

            let outName = `output.${selectedTo}`;
            let args;

            if (currentFiles.length > 1) {
                let fileList = '';
                const duration = (parseFloat(timePerFrameInput.value) || 0.0417).toFixed(4);

                for (let i = 0; i < currentFiles.length; i++) {
                    const file = currentFiles[i];
                    loadingMsg.textContent = `Preparing Image ${i + 1}/${currentFiles.length}...`;

                    // Resize image to max 1920x1080 to prevent OOM
                    const img = await createImageBitmap(file);
                    const MAX_W = 1920;
                    const MAX_H = 1080;
                    let w = img.width;
                    let h = img.height;
                    
                    if (w > MAX_W || h > MAX_H) {
                        const ratio = Math.min(MAX_W / w, MAX_H / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    img.close(); // Free memory

                    // Convert to JPEG blob (smaller than PNG)
                    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
                    const sanitizedName = `img_${i}.jpg`;
                    
                    fileList += `file '${sanitizedName}'\nduration ${duration}\n`;
                    ffmpeg.FS('writeFile', sanitizedName, await fetchFile(blob));
                }
                ffmpeg.FS('writeFile', 'filelist.txt', fileList);
                
                const fps = fpsInput.value;
                loadingMsg.textContent = 'Rendering Video...';
                args = ['-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-pix_fmt', 'yuv420p', '-r', fps, outName];
            } else { // Single image
                const file = currentFiles[0];
                loadingMsg.textContent = 'Preparing Image...';

                // Resize single image as well to be safe
                const img = await createImageBitmap(file);
                const MAX_W = 1920;
                const MAX_H = 1080;
                let w = img.width;
                let h = img.height;
                
                if (w > MAX_W || h > MAX_H) {
                    const ratio = Math.min(MAX_W / w, MAX_H / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                img.close();

                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
                const name = `input.jpg`;

                ffmpeg.FS('writeFile', name, await fetchFile(blob));
                const totalTime = totalTimeInput.value || '5';
                loadingMsg.textContent = 'Rendering Video...';
                args = ['-loop', '1', '-i', name, '-t', totalTime, '-pix_fmt', 'yuv420p', outName];
            }

            await ffmpeg.run(...args);

            const data = ffmpeg.FS('readFile', outName);
            const blob = new Blob([data.buffer], { type: `video/${selectedTo}` });
            const dataUrl = URL.createObjectURL(blob);
            
            const originalFileForUI = currentFiles[0];
            results.push({ file: originalFileForUI, dataUrl, blob, previewUrl: dataUrl });
        } else if (currentMode !== 'image') {
            if (typeof FFmpeg === 'undefined') {
                throw new Error('FFmpeg library not loaded.');
            }

            // Check for SharedArrayBuffer support (required for ffmpeg.wasm)
            if (!window.SharedArrayBuffer && !window.crossOriginIsolated) {
                const errorMsg = document.createElement('div');
                errorMsg.innerHTML = `
                    <h2>Security Headers Missing</h2>
                    <p>Video conversion requires a secure context (SharedArrayBuffer).</p>
                    <p>1. Ensure you are using a local server (e.g., <code>python -m http.server</code>).</p>
                    <p>2. Try <strong>refreshing the page</strong> manually.</p>
                    <p>3. Avoid Incognito/Private windows.</p>`;
                showPopup(errorMsg);
                return;
            }

            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({ log: true });
            
            loadingMsg.textContent = 'Loading FFmpeg Core...';
            await ffmpeg.load();

            loadingMsg.textContent = 'Processing Video...';

            // Process videos sequentially
            for (const file of currentFiles) {
                const name = file.name.replace(/\s/g, '_'); // Sanitize filename
                
                // Handle ICO/ICNS by generating PNG first
                let ffmpegTarget = selectedTo;
                if (['ico', 'icns'].includes(selectedTo)) ffmpegTarget = 'png';
                let outName = `output.${ffmpegTarget}`;

                ffmpeg.FS('writeFile', name, await fetchFile(file));
                
                let args = ['-i', name, outName];
                if (currentMode === 'video-to-audio') {
                    args = ['-i', name, '-vn', outName];
                } else if (currentMode === 'video-to-images') {
                    if (videoToImageConfig === 'every') {
                        // Extract every frame
                        outName = `out_%03d.${ffmpegTarget}`; // Pattern for multiple files
                        args = ['-i', name, outName];
                    } else {
                        // Extract a single frame (snapshot)
                        const timestamp = videoPreview.currentTime || 0;
                        args = ['-ss', timestamp.toString(), '-i', name, '-vframes', '1', outName];
                    }
                } else if (currentMode === 'audio-to-image') {
                    if (visSpectrogram && visSpectrogram.checked) {
                        args = ['-i', name, '-filter_complex', 'showspectrumpic=s=1280x720:legend=0', '-frames:v', '1', outName];
                    } else {
                        args = ['-i', name, '-filter_complex', 'showwavespic=s=1280x720', '-frames:v', '1', outName];
                    }
                } else if (currentMode === 'image-to-audio') {
                    args = ['-i', name, '-i', name, '-filter_complex', '[0:v][1:v]spectrumsynth=sample_rate=44100', outName];
                }

                await ffmpeg.run(...args);

                if (currentMode === 'video-to-images' && videoToImageConfig === 'every') {
                    // Handle multiple output files
                    const files = ffmpeg.FS('readdir', '.');
                    const outFiles = files.filter(f => f.startsWith('out_') && f.endsWith(`.${ffmpegTarget}`));
                    
                    for (const outFile of outFiles) {
                        const data = ffmpeg.FS('readFile', outFile);
                        let blob = new Blob([data.buffer], { type: `image/${ffmpegTarget}` });
                        let previewUrl = null;
                        
                        if (['ico', 'icns'].includes(selectedTo)) {
                            previewUrl = URL.createObjectURL(blob);
                            blob = await convertToIcon(blob, selectedTo);
                        }

                        const dataUrl = URL.createObjectURL(blob);
                        results.push({ 
                            file: { name: `${file.name}_${outFile}` }, // Mock name for download
                            dataUrl,
                            blob,
                            previewUrl: previewUrl || dataUrl
                        });
                        try { ffmpeg.FS('unlink', outFile); } catch(e){}
                    }
                } else {
                    // Handle single output file
                    const data = ffmpeg.FS('readFile', outName);
                    let mimeType;
                    if (currentMode === 'audio' || currentMode === 'video-to-audio' || currentMode === 'image-to-audio') {
                        mimeType = `audio/${selectedTo}`;
                    } else if (currentMode === 'video-to-images' || currentMode === 'image') {
                        mimeType = `image/${selectedTo}`;
                    } else {
                        mimeType = `video/${selectedTo}`;
                    }
                    
                    let blob = new Blob([data.buffer], { type: (['ico', 'icns'].includes(selectedTo)) ? 'image/png' : mimeType });
                    let previewUrl = null;
                    if (['ico', 'icns'].includes(selectedTo)) {
                        previewUrl = URL.createObjectURL(blob);
                        blob = await convertToIcon(blob, selectedTo);
                    }

                    const dataUrl = URL.createObjectURL(blob);
                    results.push({ file, dataUrl, blob, previewUrl: previewUrl || dataUrl });
                    try { ffmpeg.FS('unlink', outName); } catch(e){}
                }

                // Cleanup FS
                try { ffmpeg.FS('unlink', name); } catch(e){}
            }

        } else {
            // Image Conversion Logic
            // Create a map of assets for HTML resolution
            const assetMap = new Map();
            const hasHtml = currentFiles.some(f => f.name.endsWith('.html'));

            if (hasHtml) {
                const readAsDataURL = (file) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            let result = e.target.result;
                            // Fix MIME type for fonts if incorrect
                            const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
                            const mimeMap = {
                                'woff': 'font/woff',
                                'woff2': 'font/woff2',
                                'ttf': 'font/ttf',
                                'otf': 'font/otf',
                                'eot': 'application/vnd.ms-fontobject'
                            };
                            if (mimeMap[ext]) {
                                result = result.replace(/^data:.*?;base64/, `data:${mimeMap[ext]};base64`);
                            }
                            resolve(result);
                        };
                        reader.readAsDataURL(file);
                    });
                };

                // Helper: fetch a remote URL and return it as a base64 data URL
                const fetchAsDataURL = async (url) => {
                    try {
                        const resp = await fetch(url);
                        if (!resp.ok) return null;
                        const blob = await resp.blob();
                        return await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.warn('Could not fetch remote asset:', url, e);
                        return null;
                    }
                };

                // Helper: inline all url(...) references inside a CSS string,
                // resolving both local (assetMap) and remote (fetch) sources.
                const inlineUrlsInCss = async (css) => {
                    const urlRegex = /url\((['"]?)(.*?)\1\)/g;
                    const matches = [...css.matchAll(urlRegex)];
                    for (const [fullMatch, quote, url] of matches) {
                        if (!url || url.startsWith('data:')) continue;
                        // Local asset uploaded by the user
                        const filename = url.split('/').pop().split('?')[0].split('#')[0];
                        if (assetMap.has(filename)) {
                            css = css.replace(fullMatch, `url(${quote}${assetMap.get(filename)}${quote})`);
                        } else if (url.startsWith('http://') || url.startsWith('https://')) {
                            // Remote asset (e.g. Google Fonts individual font file)
                            const dataUrl = await fetchAsDataURL(url);
                            if (dataUrl) {
                                css = css.replace(fullMatch, `url(${quote}${dataUrl}${quote})`);
                            }
                        }
                    }
                    return css;
                };

                // 1. Load non-CSS/HTML assets (images, fonts)
                for (const file of currentFiles) {
                    if (!file.name.endsWith('.html') && !file.name.endsWith('.css')) {
                        assetMap.set(file.name, await readAsDataURL(file));
                    }
                }
                
                // 2. Pre-process CSS files to resolve fonts and images
                for (const file of currentFiles) {
                    if (file.name.endsWith('.css')) {
                        let cssContent = await file.text();
                        cssContent = await inlineUrlsInCss(cssContent);
                        const blob = new Blob([cssContent], { type: 'text/css' });
                        assetMap.set(file.name, await readAsDataURL(blob));
                    }
                }
            }

            let filesToProcess = currentFiles;
            if (hasHtml) {
                filesToProcess = currentFiles.filter(f => f.name.endsWith('.html'));
            }

            const conversions = filesToProcess.map(async (file) => {
                let canvas;

                if (file.type === 'text/html' || file.name.endsWith('.html')) {
                    let htmlContent = await file.text();

                    // Helper: fetch a remote URL and return it as a base64 data URL
                    const fetchAsDataURL = async (url) => {
                        try {
                            const resp = await fetch(url);
                            if (!resp.ok) return null;
                            const blob = await resp.blob();
                            return await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => resolve(e.target.result);
                                reader.readAsDataURL(blob);
                            });
                        } catch (e) {
                            console.warn('Could not fetch remote asset:', url, e);
                            return null;
                        }
                    };

                    // Helper: inline all url(...) references inside a CSS string
                    const inlineUrlsInCss = async (css) => {
                        const urlRegex = /url\((['"]?)(.*?)\1\)/g;
                        const matches = [...css.matchAll(urlRegex)];
                        for (const [fullMatch, quote, url] of matches) {
                            if (!url || url.startsWith('data:')) continue;
                            const filename = url.split('/').pop().split('?')[0].split('#')[0];
                            if (assetMap.has(filename)) {
                                css = css.replace(fullMatch, `url(${quote}${assetMap.get(filename)}${quote})`);
                            } else if (url.startsWith('http://') || url.startsWith('https://')) {
                                const dataUrl = await fetchAsDataURL(url);
                                if (dataUrl) {
                                    css = css.replace(fullMatch, `url(${quote}${dataUrl}${quote})`);
                                }
                            }
                        }
                        return css;
                    };
                    
                    // Parse HTML and replace asset references
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');
                    
                    // Helper to replace attributes (local assets)
                    const replaceAttr = (selector, attr) => {
                        doc.querySelectorAll(selector).forEach(el => {
                            const val = el.getAttribute(attr);
                            const filename = val ? val.split('/').pop() : null;
                            if (filename && assetMap.has(filename)) {
                                el.setAttribute(attr, assetMap.get(filename));
                            }
                        });
                    };

                    replaceAttr('[src]', 'src');

                    // Handle <link rel="stylesheet"> — inline local CSS or fetch remote CSS
                    for (const linkEl of Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))) {
                        const href = linkEl.getAttribute('href');
                        if (!href) continue;
                        const filename = href.split('/').pop().split('?')[0];
                        let cssText = null;

                        if (assetMap.has(filename)) {
                            // Local CSS already processed into a data URL — decode it back to text
                            const dataUrl = assetMap.get(filename);
                            const base64 = dataUrl.split(',')[1];
                            cssText = atob(base64);
                        } else if (href.startsWith('http://') || href.startsWith('https://')) {
                            // Remote stylesheet (e.g. Google Fonts CSS)
                            try {
                                const resp = await fetch(href);
                                if (resp.ok) cssText = await resp.text();
                            } catch (e) {
                                console.warn('Could not fetch remote stylesheet:', href, e);
                            }
                        }

                        if (cssText) {
                            // Inline all font/image URLs inside the fetched CSS
                            cssText = await inlineUrlsInCss(cssText);
                            // Replace <link> with an inline <style>
                            const styleEl = doc.createElement('style');
                            styleEl.textContent = cssText;
                            linkEl.parentNode.replaceChild(styleEl, linkEl);
                        }
                    }

                    // Process existing inline <style> blocks —
                    // inline local/remote font URLs and resolve @import rules
                    for (const styleEl of Array.from(doc.querySelectorAll('style'))) {
                        let css = styleEl.textContent;

                        // Resolve @import url(...) — fetch the imported stylesheet and inline it
                        const importRegex = /@import\s+url\((['"]?)(.*?)\1\)\s*;?/g;
                        const importMatches = [...css.matchAll(importRegex)];
                        for (const [fullMatch, , importUrl] of importMatches) {
                            if (!importUrl) continue;
                            try {
                                const resp = await fetch(importUrl);
                                if (resp.ok) {
                                    let importedCss = await resp.text();
                                    importedCss = await inlineUrlsInCss(importedCss);
                                    css = css.replace(fullMatch, importedCss);
                                }
                            } catch (e) {
                                console.warn('Could not fetch @import stylesheet:', importUrl, e);
                            }
                        }

                        // Also handle @import 'url' (without url() wrapper)
                        const importBareRegex = /@import\s+(['"])(https?:\/\/.*?)\1\s*;?/g;
                        const importBareMatches = [...css.matchAll(importBareRegex)];
                        for (const [fullMatch, , importUrl] of importBareMatches) {
                            try {
                                const resp = await fetch(importUrl);
                                if (resp.ok) {
                                    let importedCss = await resp.text();
                                    importedCss = await inlineUrlsInCss(importedCss);
                                    css = css.replace(fullMatch, importedCss);
                                }
                            } catch (e) {
                                console.warn('Could not fetch @import stylesheet:', importUrl, e);
                            }
                        }

                        // Inline remaining url() references (local fonts or remote font files)
                        css = await inlineUrlsInCss(css);
                        styleEl.textContent = css;
                    }

                    htmlContent = new XMLSerializer().serializeToString(doc);
                    
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'fixed';
                    iframe.style.left = '-9999px';
                    iframe.style.top = '0';
                    iframe.style.width = '1920px';
                    iframe.style.height = '1080px';
                    iframe.style.border = 'none';
                    
                    document.body.appendChild(iframe);
                    
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(htmlContent);
                    iframeDoc.close();

                    // Wait for resources to load and fonts to be ready
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    try {
                        await iframeDoc.fonts.ready;
                        // Extra wait to ensure fonts have actually painted
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (e) {
                        console.warn('Fonts not ready:', e);
                    }

                    const body = iframeDoc.body;
                    const html = iframeDoc.documentElement;
                    const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
                    const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

                    canvas = await html2canvas(iframeDoc.documentElement, {
                        width: width,
                        height: height,
                        useCORS: true,
                        allowTaint: true,
                        scale: 2
                    });
                    
                    document.body.removeChild(iframe);
                } else if (file.type.startsWith('image/')) {
                    const img = await new Promise((resolve, reject) => {
                        const i = new Image();
                        const url = URL.createObjectURL(file);
                        i.onload = () => resolve(i);
                        i.onerror = () => reject(new Error('Failed to load image'));
                        i.src = url;
                    });

                    let width = img.naturalWidth || img.width;
                    let height = img.naturalHeight || img.height;

                    if (['ico', 'icns'].includes(selectedTo)) {
                        width = 256;
                        height = 256;
                    }

                    if (file.type === 'image/svg+xml') {
                        const scale = parseFloat(svgScaleInput.value) || 2;
                        width *= scale;
                        height *= scale;
                    }

                    canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(img.src);
                } else {
                    return null; // Skip non-convertible assets (css, js, etc.)
                }

                return processCanvas(canvas, file);
            });
            results = (await Promise.all(conversions)).filter(r => r !== null);
        }

        // Create Download UI
        const container = document.createElement('div');
        container.style.maxHeight = '70vh';
        container.style.overflowY = 'auto';
        
        const title = document.createElement('h2');
        title.textContent = 'Conversion Complete!';
        title.style.marginBottom = '20px';
        
        container.appendChild(title);

        if (results.length === 1) {
            const { file, dataUrl, blob, previewUrl } = results[0];
            
            const downloadBtn = document.createElement('button');
            if (currentMode === 'video' || currentMode === 'images-to-video') {
                downloadBtn.textContent = 'Download Video';
            } else if (currentMode === 'audio' || currentMode === 'video-to-audio' || currentMode === 'image-to-audio') {
                downloadBtn.textContent = 'Download Audio';
            } else {
                downloadBtn.textContent = 'Download Image';
            }
            
            downloadBtn.onclick = () => {
                const originalName = file.name.split('.')[0];
                saveFile(blob, `${originalName}.${selectedTo}`);
            };

            const compareBtn = document.createElement('button');
            compareBtn.textContent = 'Compare';
            compareBtn.style.marginLeft = '10px';
            compareBtn.onclick = () => {
                const compareContainer = document.createElement('div');
                const compareTitle = document.createElement('h2');
                compareTitle.textContent = 'Comparison';
                compareTitle.style.marginBottom = '20px';
                const imgContainer = document.createElement('div');
                imgContainer.style.display = 'flex';
                imgContainer.style.justifyContent = 'space-around';
                imgContainer.style.alignItems = 'center';
                imgContainer.style.gap = '10px';
                imgContainer.style.marginBottom = '20px';
                const addMedia = (src, labelText, mediaType) => {
                    const wrapper = document.createElement('div');
                    wrapper.style.flex = '1';
                    const label = document.createElement('h3');
                    label.textContent = labelText;
                    
                    let media;
                    if (mediaType === 'video' || mediaType === 'images-to-video') {
                        media = document.createElement('video');
                        media.controls = true;
                    } else if (mediaType === 'audio' || mediaType === 'video-to-audio') {
                        media = document.createElement('audio');
                        media.controls = true;
                    } else {
                        media = document.createElement('img');
                    }
                    media.src = src;
                    media.style.maxWidth = '100%';
                    media.style.maxHeight = '50vh';
                    media.style.border = '1px solid #ccc';
                    wrapper.appendChild(label);
                    wrapper.appendChild(media);
                    return wrapper;
                };
                
                let originalType = 'image';
                if (currentMode === 'video' || currentMode.startsWith('video-')) originalType = !file.name.toLowerCase().endsWith('.gif') ? 'video' : 'image';
                if (currentMode === 'audio' || currentMode === 'video-to-audio' || currentMode === 'audio-to-image') originalType = 'audio';

                let outputType = 'image';
                if (currentMode === 'video' || currentMode === 'images-to-video') outputType = selectedTo !== 'gif' ? 'video' : 'image';
                if (currentMode === 'audio' || currentMode === 'video-to-audio' || currentMode === 'image-to-audio') outputType = 'audio';

                imgContainer.appendChild(addMedia(URL.createObjectURL(file), 'Original', originalType));
                imgContainer.appendChild(addMedia(previewUrl, 'Converted', outputType));
                const backBtn = document.createElement('button');
                backBtn.textContent = 'Back';
                backBtn.onclick = () => { showPopup(container); };
                compareContainer.appendChild(compareTitle);
                compareContainer.appendChild(imgContainer);
                compareContainer.appendChild(backBtn);
                showPopup(compareContainer);
                popup.style.width = '80vw';
            };
            
            container.appendChild(downloadBtn);
            container.appendChild(compareBtn);
        } else {
            // Multiple files
            const downloadAllBtn = document.createElement('button');
            downloadAllBtn.textContent = 'Download All';
            downloadAllBtn.style.width = '100%';
            downloadAllBtn.style.marginBottom = '10px';
            downloadAllBtn.style.backgroundColor = 'var(--highlight-color)';
            downloadAllBtn.style.color = '#fff';
            downloadAllBtn.onclick = async () => {
                if (currentMode === 'video-to-images' && videoToImageConfig === 'every') {
                    const zip = new JSZip();
                    const baseName = currentFiles[0].name.split('.')[0];
                    const folder = zip.folder(baseName + "_frames");
                    
                    results.forEach(r => {
                        folder.file(r.file.name, r.blob);
                    });
                    
                    const content = await zip.generateAsync({type:"blob"});
                    saveFile(content, `${baseName}_frames.zip`);
                } else {
                    for (const result of results) {
                        const originalName = result.file.name.split('.')[0];
                        await saveFile(result.blob, `${originalName}.${selectedTo}`);
                    }
                }
            };
            container.appendChild(downloadAllBtn);

            if (!(currentMode === 'video-to-images' && videoToImageConfig === 'every')) {
                const compareAllBtn = document.createElement('button');
                compareAllBtn.textContent = 'Compare All';
                compareAllBtn.style.width = '100%';
                compareAllBtn.style.marginBottom = '20px';
                compareAllBtn.onclick = () => {
                    const compareContainer = document.createElement('div');
                    compareContainer.style.maxHeight = '80vh';
                    compareContainer.style.overflowY = 'auto';
                    
                    const compareTitle = document.createElement('h2');
                    compareTitle.textContent = 'Comparison';
                    compareTitle.style.marginBottom = '20px';
                    compareContainer.appendChild(compareTitle);

                    results.forEach(({ file, dataUrl, previewUrl }) => {
                        const row = document.createElement('div');
                        row.style.marginBottom = '20px';
                        row.style.borderBottom = '1px solid #ccc';
                        row.style.paddingBottom = '10px';
                        
                        const fName = document.createElement('p');
                        fName.textContent = file.name;
                        fName.style.fontWeight = 'bold';
                        row.appendChild(fName);

                        const imgContainer = document.createElement('div');
                        imgContainer.style.display = 'flex';
                        imgContainer.style.justifyContent = 'space-around';
                        imgContainer.style.alignItems = 'center';
                        imgContainer.style.gap = '10px';

                        const addMedia = (src, labelText, mediaType) => {
                            const wrapper = document.createElement('div');
                            wrapper.style.flex = '1';
                            const label = document.createElement('h3');
                            label.textContent = labelText;
                            
                            let media;
                            if (mediaType === 'video' || mediaType === 'images-to-video') {
                                media = document.createElement('video');
                                media.controls = true;
                            } else if (mediaType === 'audio' || mediaType === 'video-to-audio') {
                                media = document.createElement('audio');
                                media.controls = true;
                            } else {
                                media = document.createElement('img');
                            }
                            media.src = src;
                            media.style.maxWidth = '100%';
                            media.style.maxHeight = '30vh';
                            media.style.border = '1px solid #ccc';
                            wrapper.appendChild(label);
                            wrapper.appendChild(media);
                            return wrapper;
                        };

                        let originalType = 'image';
                        if (currentMode === 'video' || currentMode.startsWith('video-')) originalType = !file.name.toLowerCase().endsWith('.gif') ? 'video' : 'image';
                        if (currentMode === 'audio' || currentMode === 'audio-to-image') originalType = 'audio';

                        let outputType = 'image';
                        if (currentMode === 'video' || currentMode === 'images-to-video') outputType = selectedTo !== 'gif' ? 'video' : 'image';
                        if (currentMode === 'audio' || currentMode === 'video-to-audio' || currentMode === 'image-to-audio') outputType = 'audio';

                        imgContainer.appendChild(addMedia(URL.createObjectURL(file), 'Original', originalType));
                        imgContainer.appendChild(addMedia(previewUrl, 'Converted', outputType));
                        row.appendChild(imgContainer);
                        compareContainer.appendChild(row);
                    });

                    const backBtn = document.createElement('button');
                    backBtn.textContent = 'Back';
                    backBtn.style.marginTop = '10px';
                    backBtn.onclick = () => {
                        showPopup(container);
                        popup.style.width = '';
                    };
                    compareContainer.appendChild(backBtn);

                    showPopup(compareContainer);
                    popup.style.width = '90vw';
                };
                container.appendChild(compareAllBtn);
            }

            if (!(currentMode === 'video-to-images' && videoToImageConfig === 'every')) {
                results.forEach(({ file, dataUrl }) => {
                    const btn = document.createElement('button');
                    const originalName = file.name.split('.')[0];
                    btn.textContent = `Download ${originalName}.${selectedTo}`;
                    btn.style.display = 'block';
                    btn.style.width = '100%';
                    btn.style.marginBottom = '10px';
                    btn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        link.download = `${originalName}.${selectedTo}`;
                        link.click();
                    };
                    container.appendChild(btn);
                });
            } else {
                const countMsg = document.createElement('p');
                countMsg.textContent = `${results.length} frames extracted.`;
                countMsg.style.textAlign = 'center';
                countMsg.style.marginBottom = '10px';
                container.appendChild(countMsg);
            }
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.marginLeft = '10px';
        closeBtn.onclick = closePopup;

        container.appendChild(closeBtn);

        showPopup(container);

    } catch (error) {
        console.error(error);
        const errorMsg = document.createElement('h2');
        errorMsg.textContent = 'Error converting file. (Check console for details)';
        showPopup(errorMsg);
    }
}

async function saveFile(blob, filename) {
    if (downloadDirHandle) {
        try {
            const fileHandle = await downloadDirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (e) {
            console.error('Error saving to directory:', e);
            alert('Failed to save to selected directory. Falling back to default download.');
        }
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

async function processCanvas(canvas, file) {
    let dataUrl;

    if (selectedTo === 'svg') {
        const imgData = canvas.toDataURL('image/png');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${imgData}" width="${canvas.width}" height="${canvas.height}" /></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        dataUrl = URL.createObjectURL(blob);
        return { file, dataUrl, blob, previewUrl: dataUrl };
    } else {
        // Determine MIME type
        let mimeType = 'image/png'; // Default
        if (selectedTo === 'jpg') mimeType = 'image/jpeg';
        if (selectedTo === 'webp') mimeType = 'image/webp';
        if (selectedTo === 'avif') mimeType = 'image/avif';
        
        let blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType || 'image/png'));
        let previewUrl = null;
        if (['ico', 'icns'].includes(selectedTo)) {
            previewUrl = URL.createObjectURL(blob);
            blob = await convertToIcon(blob, selectedTo);
        }

        dataUrl = URL.createObjectURL(blob);
        return { file, dataUrl, blob, previewUrl: previewUrl || dataUrl };
    }
}

async function convertToIcon(blob, format) {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 256, 256);
    const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const pngBuffer = await pngBlob.arrayBuffer();

    if (format === 'ico') {
        const header = new Uint8Array([0, 0, 1, 0, 1, 0]);
        const entry = new DataView(new ArrayBuffer(16));
        entry.setUint8(0, 0); // 256
        entry.setUint8(1, 0); // 256
        entry.setUint8(2, 0);
        entry.setUint8(3, 0);
        entry.setUint16(4, 1, true);
        entry.setUint16(6, 32, true);
        entry.setUint32(8, pngBuffer.byteLength, true);
        entry.setUint32(12, 22, true);
        return new Blob([header, entry, pngBuffer], { type: 'image/x-icon' });
    } else if (format === 'icns') {
        const fileSize = 16 + pngBuffer.byteLength;
        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        view.setUint8(0, 0x69); view.setUint8(1, 0x63); view.setUint8(2, 0x6e); view.setUint8(3, 0x73);
        view.setUint32(4, fileSize, false);
        view.setUint8(8, 0x69); view.setUint8(9, 0x63); view.setUint8(10, 0x30); view.setUint8(11, 0x38);
        view.setUint32(12, 8 + pngBuffer.byteLength, false);
        const payload = new Uint8Array(buffer);
        payload.set(new Uint8Array(pngBuffer), 16);
        return new Blob([buffer], { type: 'image/icns' });
    }
    return blob;
}

init();