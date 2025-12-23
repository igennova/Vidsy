import { create } from 'zustand';

// Types for our video editor
export interface VideoFile {
    id: string;
    file: File;
    name: string;
    url: string; // Object URL for preview
    duration: number;
    size: number;
    type: string;
    thumbnail?: string;
    width?: number;
    height?: number;
}

export interface Clip {
    id: string;
    videoId: string; // Reference to VideoFile
    name: string;
    start: number; // Position on timeline
    duration: number;
    trimStart: number; // Trim from original video
    trimEnd: number;
    trackId: number;
}

export interface Track {
    id: number;
    name: string;
    type: 'video' | 'audio';
    clips: Clip[];
}

interface EditorStore {
    // Video files uploaded by user
    videos: VideoFile[];

    // Timeline tracks
    tracks: Track[];

    // Playback state
    isPlaying: boolean;
    currentTime: number;
    duration: number;

    // UI state
    selectedClipId: string | null;
    selectedTrackId: number | null;
    zoom: number;

    // Actions
    addVideo: (file: File) => Promise<void>;
    removeVideo: (id: string) => void;
    addClipToTimeline: (videoId: string, trackId: number) => void;
    removeClip: (clipId: string) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    setPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setSelectedClip: (clipId: string | null) => void;
    setSelectedTrack: (trackId: number | null) => void;
    setZoom: (zoom: number) => void;
}

// Helper function to get video metadata (optimized for performance)
const getVideoMetadata = (file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    thumbnail: string;
}> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true; // Prevent audio playback

        let thumbnailGenerated = false;

        video.onloadedmetadata = () => {
            // Seek to 0.1 seconds instead of 1 (faster for short videos)
            video.currentTime = Math.min(0.1, video.duration / 2);
        };

        video.onseeked = () => {
            if (thumbnailGenerated) return;
            thumbnailGenerated = true;

            try {
                // Use smaller thumbnail size for better performance
                const maxWidth = 320;
                const maxHeight = 180;
                const scale = Math.min(maxWidth / video.videoWidth, maxHeight / video.videoHeight);

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth * scale;
                canvas.height = video.videoHeight * scale;

                const ctx = canvas.getContext('2d', { alpha: false });
                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }

                // Draw scaled-down version
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Lower quality for smaller file size (0.5 instead of 0.7)
                const thumbnail = canvas.toDataURL('image/jpeg', 0.5);

                resolve({
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    thumbnail
                });

                // Clean up
                video.src = '';
                canvas.remove();
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => {
            reject(new Error('Failed to load video metadata'));
        };

        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            reject(new Error('Video metadata loading timeout'));
        }, 10000); // 10 second timeout

        video.onloadedmetadata = () => {
            clearTimeout(timeout);
            video.currentTime = Math.min(0.1, video.duration / 2);
        };

        video.src = URL.createObjectURL(file);
    });
};

export const useEditorStore = create<EditorStore>((set, get) => ({
    // Initial state
    videos: [],
    tracks: [
        { id: 1, name: 'Video Track 1', type: 'video', clips: [] },
        { id: 2, name: 'Video Track 2', type: 'video', clips: [] },
        { id: 3, name: 'Audio Track 1', type: 'audio', clips: [] },
    ],
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    selectedClipId: null,
    selectedTrackId: null,
    zoom: 1,

    // Actions
    addVideo: async (file: File) => {
        try {
            // Validate file type
            if (!file.type.startsWith('video/')) {
                throw new Error('Please upload a valid video file');
            }

            // Create object URL for the video
            const url = URL.createObjectURL(file);

            // Get video metadata (duration, dimensions, thumbnail)
            const metadata = await getVideoMetadata(file);

            // Create video object
            const video: VideoFile = {
                id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                name: file.name,
                url,
                duration: metadata.duration,
                size: file.size,
                type: file.type,
                thumbnail: metadata.thumbnail,
                width: metadata.width,
                height: metadata.height,
            };

            // Add to store
            set((state) => ({
                videos: [...state.videos, video]
            }));

            console.log('✅ Video uploaded successfully:', video);
        } catch (error) {
            console.error('❌ Error uploading video:', error);
            throw error;
        }
    },

    removeVideo: (id: string) => {
        const state = get();
        const video = state.videos.find(v => v.id === id);

        if (video) {
            // Revoke object URL to free memory
            URL.revokeObjectURL(video.url);
        }

        // Remove video and any clips using it
        set((state) => ({
            videos: state.videos.filter(v => v.id !== id),
            tracks: state.tracks.map(track => ({
                ...track,
                clips: track.clips.filter(clip => clip.videoId !== id)
            }))
        }));
    },

    addClipToTimeline: (videoId: string, trackId: number) => {
        const state = get();
        const video = state.videos.find(v => v.id === videoId);

        if (!video) return;

        // Find the track
        const track = state.tracks.find(t => t.id === trackId);
        if (!track) return;

        // Calculate start position (after last clip on this track)
        let startPosition = 0;
        if (track.clips.length > 0) {
            const lastClip = track.clips[track.clips.length - 1];
            startPosition = lastClip.start + lastClip.duration;
        }

        const clip: Clip = {
            id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            videoId,
            name: video.name,
            start: startPosition, // Place after previous clip
            duration: video.duration,
            trimStart: 0,
            trimEnd: video.duration,
            trackId,
        };

        // Calculate new timeline duration
        const newClipEnd = clip.start + clip.duration;
        const newDuration = Math.max(state.duration, newClipEnd);

        set((state) => ({
            tracks: state.tracks.map(track =>
                track.id === trackId
                    ? { ...track, clips: [...track.clips, clip] }
                    : track
            ),
            duration: newDuration, // Update timeline duration
        }));

        console.log('✅ Clip added to timeline:', clip);
        console.log('📏 Timeline duration updated to:', newDuration);
    },

    removeClip: (clipId: string) => {
        const state = get();

        // Remove clip and recalculate duration
        const newTracks = state.tracks.map(track => ({
            ...track,
            clips: track.clips.filter(clip => clip.id !== clipId)
        }));

        // Find the maximum end time across all clips
        let maxDuration = 120; // Minimum 2 minutes
        newTracks.forEach(track => {
            track.clips.forEach(clip => {
                const clipEnd = clip.start + clip.duration;
                maxDuration = Math.max(maxDuration, clipEnd);
            });
        });

        set({
            tracks: newTracks,
            duration: maxDuration,
            selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId
        });
    },

    updateClip: (clipId: string, updates: Partial<Clip>) => {
        set((state) => ({
            tracks: state.tracks.map(track => ({
                ...track,
                clips: track.clips.map(clip =>
                    clip.id === clipId ? { ...clip, ...updates } : clip
                )
            }))
        }));
    },

    setPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
    },

    setCurrentTime: (time: number) => {
        set({ currentTime: time });
    },

    setSelectedClip: (clipId: string | null) => {
        set({ selectedClipId: clipId });
    },

    setSelectedTrack: (trackId: number | null) => {
        set({ selectedTrackId: trackId });
    },

    setZoom: (zoom: number) => {
        set({ zoom: Math.max(0.5, Math.min(3, zoom)) });
    },
}));
