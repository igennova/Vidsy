// Use type-only imports to avoid bundling issues
import type { Clip, VideoFile, Track } from '@/stores/editorStore';

// We need to declare the types we expect from the loaded libraries
// since we are loading them manually via script tags
declare global {
    interface Window {
        FFmpegWASM: {
            FFmpeg: any;
        };
        FFmpegUtil: {
            fetchFile: (file: File | Blob | string) => Promise<Uint8Array>;
            toBlobURL: (url: string, mimeType: string) => Promise<string>;
        };
    }
}

// Singleton instances
let ffmpegInstance: any = null;
let isLoaded = false;

const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        // Important for WASM/SharedArrayBuffer environments
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
    });
};

export const loadFFmpeg = async () => {
    if (typeof window === 'undefined') {
        throw new Error('FFmpeg can only be loaded on the client side');
    }

    if (ffmpegInstance && isLoaded) {
        return { ffmpeg: ffmpegInstance, fetchFile: window.FFmpegUtil?.fetchFile };
    }

    try {
        // Load local scripts from public/ffmpeg/ to avoid CORS and bundling issues
        // These files were downloaded to public/ffmpeg/
        await loadScript('/ffmpeg/ffmpeg.js');
        await loadScript('/ffmpeg/util.js');

        // Wait up to 2 seconds for window.FFmpegWASM to be available (UMD init time)
        let retries = 20;
        while ((!window.FFmpegWASM || !window.FFmpegUtil) && retries > 0) {
            await new Promise(r => setTimeout(r, 100));
            retries--;
        }

        if (!window.FFmpegWASM) throw new Error('FFmpeg script loaded but window.FFmpegWASM is missing');
        if (!window.FFmpegUtil) throw new Error('FFmpegUtil script loaded but window.FFmpegUtil is missing');

        const { FFmpeg: FFmpegClass } = window.FFmpegWASM;
        const prepareBlobURL = window.FFmpegUtil.toBlobURL;

        const ffmpeg = new FFmpegClass();

        // Load local core files
        const baseURL = window.location.origin + '/ffmpeg';
        const coreURL = await prepareBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await prepareBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

        await ffmpeg.load({
            coreURL,
            wasmURL,
            // workerLoadURL: await prepareBlobURL(`${baseURL}/814.ffmpeg.js`, 'text/javascript')
        });

        ffmpegInstance = ffmpeg;
        isLoaded = true;

        return { ffmpeg, fetchFile: window.FFmpegUtil.fetchFile };
    } catch (error: any) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error(`Failed to initialize video export: ${error.message || 'Unknown error'}`);
    }
};

export const exportVideo = async (
    tracks: Track[],
    videos: VideoFile[],
    onProgress?: (progress: number) => void
): Promise<Blob> => {
    const { ffmpeg, fetchFile } = await loadFFmpeg();

    // 1. Gather and Sort Video Clips
    const videoClips: Array<{ clip: Clip; video: VideoFile }> = [];

    for (const track of tracks) {
        if (track.type === 'video') {
            for (const clip of track.clips) {
                const video = videos.find(v => v.id === clip.videoId);
                if (video) {
                    videoClips.push({ clip, video });
                }
            }
        }
    }

    if (videoClips.length === 0) {
        throw new Error('No video clips to export. Add videos to the timeline first.');
    }

    // Sort by timeline position
    videoClips.sort((a, b) => a.clip.start - b.clip.start);

    // 2. Process Each Clip (Trim & Standardize)
    const totalClips = videoClips.length;
    let fileListContent = '';

    // Standardize settings to prevent concat issues
    const COMMON_WIDTH = 1280;
    const COMMON_HEIGHT = 720;
    const COMMON_FPS = 30;

    for (let i = 0; i < totalClips; i++) {
        const { clip, video } = videoClips[i];
        const inputName = `input_${i}.mp4`;
        const outputName = `part_${i}.ts`; // .ts is easier to concat reliably than .mp4

        // Update progress
        if (onProgress) {
            onProgress((i / (totalClips + 1)) * 100);
        }

        // Write file
        const videoData = await fetchFile(video.url);
        await ffmpeg.writeFile(inputName, videoData);

        // Calculate trim arguments
        const duration = clip.trimEnd - clip.trimStart;

        // Command to trim + scale + fps + format
        // We force re-encoding to ensure all chunks match parameters for concat
        const args = [
            '-i', inputName,
            '-ss', clip.trimStart.toString(),
            '-t', duration.toString(),
            '-vf', `scale=${COMMON_WIDTH}:${COMMON_HEIGHT}:force_original_aspect_ratio=decrease,pad=${COMMON_WIDTH}:${COMMON_HEIGHT}:(ow-iw)/2:(oh-ih)/2,fps=${COMMON_FPS}`,
            '-c:v', 'libx264',
            '-preset', 'ultrafast', // fast encoding for browser
            '-c:a', 'aac',
            '-ar', '44100', // standard audio rate
            '-f', 'mpegts', // intermediate format
            outputName
        ];

        console.log(`Processing clip ${i + 1}/${totalClips}:`, args.join(' '));
        try {
            await ffmpeg.exec(args);
        } catch (e) {
            console.error('Error processing clip ' + i, e);
            throw new Error(`Failed to process clip ${i + 1}`);
        }

        // Add to list
        fileListContent += `file '${outputName}'\n`;

        // Delete input to save memory
        await ffmpeg.deleteFile(inputName);
    }

    // 3. Concatenate
    if (onProgress) onProgress(90);

    await ffmpeg.writeFile('concat_list.txt', fileListContent);
    const finalOutput = 'final_output.mp4';

    console.log('Concatenating files...');
    await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat_list.txt',
        '-c', 'copy', // Copy because we already re-encoded to matching formats
        finalOutput
    ]);

    // Cleanup intermediate parts
    for (let i = 0; i < totalClips; i++) {
        try {
            await ffmpeg.deleteFile(`part_${i}.ts`);
        } catch (e) { /* ignore */ }
    }
    await ffmpeg.deleteFile('concat_list.txt');

    // 4. Read Final Result
    const data = await ffmpeg.readFile(finalOutput);
    await ffmpeg.deleteFile(finalOutput);

    if (data instanceof Uint8Array) {
        return new Blob([data], { type: 'video/mp4' });
    } else {
        // Handle case where data might be a standard array or other type if updated
        return new Blob([new Uint8Array(data as any)], { type: 'video/mp4' });
    }
};

export const downloadVideo = (blob: Blob, filename: string = 'exported-video.mp4') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
