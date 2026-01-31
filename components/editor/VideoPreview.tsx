"use client"
import React, { useRef, useEffect } from 'react';
import { Film, Play, Pause } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface VideoPreviewProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onTogglePlay: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
    isPlaying,
    currentTime,
    duration,
    onTogglePlay
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { tracks, videos, setCurrentTime } = useEditorStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Find the active clip at current time
    const getActiveClip = () => {
        for (const track of tracks) {
            if (track.type === 'video') {
                for (const clip of track.clips) {
                    const clipEnd = clip.start + clip.duration;
                    if (currentTime >= clip.start && currentTime < clipEnd) {
                        // Find the video file
                        const video = videos.find(v => v.id === clip.videoId);
                        if (video) {
                            return {
                                video,
                                clip,
                                relativeTime: currentTime - clip.start + clip.trimStart
                            };
                        }
                    }
                }
            }
        }
        return null;
    };

    const activeClip = getActiveClip();

    // Sync video element with playback state
    useEffect(() => {
        if (!videoRef.current || !activeClip) return;

        if (isPlaying) {
            videoRef.current.play().catch(err => console.log('Play error:', err));
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying, activeClip]);

    // Sync video time with timeline
    useEffect(() => {
        if (!videoRef.current || !activeClip) return;

        const targetTime = activeClip.relativeTime;
        const currentVideoTime = videoRef.current.currentTime;

        // Only seek if difference is significant (avoid jitter)
        if (Math.abs(currentVideoTime - targetTime) > 0.1) {
            videoRef.current.currentTime = targetTime;
        }
    }, [activeClip?.relativeTime]);

    // Update timeline time as video plays
    useEffect(() => {
        if (!videoRef.current || !isPlaying || !activeClip) return;

        const interval = setInterval(() => {
            if (videoRef.current) {
                const newTime = activeClip.clip.start + (videoRef.current.currentTime - activeClip.clip.trimStart);
                setCurrentTime(newTime);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, activeClip, setCurrentTime]);

    return (
        <div className="flex-1 p-4 flex items-center justify-center bg-black/20 relative">
            <div className="absolute inset-0 bg-grid opacity-5" />

            {/* Preview Window */}
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg border border-white/20 shadow-2xl overflow-hidden group">
                {activeClip ? (
                    <>
                        {/* Actual Video Element */}
                        <video
                            ref={videoRef}
                            src={activeClip.video.url}
                            className="absolute inset-0 w-full h-full object-contain"
                            playsInline
                        />
                    </>
                ) : (
                    <>
                        {/* Placeholder when no video */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-lime-500/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto backdrop-blur-sm">
                                    <Film className="w-10 h-10 text-emerald-400" />
                                </div>
                                <p className="text-zinc-500 text-sm">Add videos to timeline to preview</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <button
                        onClick={onTogglePlay}
                        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 text-white" />
                        ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                        )}
                    </button>
                </div>

                {/* Top Right Info */}
                {activeClip && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 text-xs text-white font-mono">
                            {activeClip.video.width}x{activeClip.video.height}
                        </div>
                        <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 text-xs text-white font-mono">
                            30 FPS
                        </div>
                    </div>
                )}

                {/* Bottom Timecode */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 text-sm text-white font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Current Clip Name */}
                {activeClip && (
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 text-xs text-white">
                        {activeClip.clip.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPreview;
