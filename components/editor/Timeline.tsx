"use client"
import React, { useRef, useState } from 'react';
import { Clock, Grid3x3, Film, Music } from 'lucide-react';
import { useEditorStore, Clip as ClipType } from '@/stores/editorStore';

interface Track {
    id: number;
    name: string;
    type: 'video' | 'audio';
    color: 'emerald' | 'teal' | 'lime' | 'green';
    clips: ClipType[];
}

interface TimelineProps {
    tracks: Track[];
    currentTime: number;
    duration: number;
    selectedTrack: number | null;
    onTrackSelect: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
    tracks,
    currentTime,
    duration,
    selectedTrack,
    onTrackSelect
}) => {
    const rulerRef = useRef<HTMLDivElement>(null);
    const trackContentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [trimmingClip, setTrimmingClip] = useState<{ clipId: string; side: 'left' | 'right' } | null>(null);
    
    const { 
        setCurrentTime, 
        setPlaying, 
        selectedClipId, 
        setSelectedClip,
        updateClip,
        splitClip,
        trimClip,
        videos
    } = useEditorStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const baseClasses = isSelected 
            ? 'bg-emerald-500/30 border-emerald-400 border-2' 
            : 'bg-emerald-500/20 border-emerald-500/50 border-2';
        
        switch (color) {
            case 'emerald':
                return isSelected ? 'bg-emerald-500/30 border-emerald-400' : 'bg-emerald-500/20 border-emerald-500/50';
            case 'teal':
                return isSelected ? 'bg-teal-500/30 border-teal-400' : 'bg-teal-500/20 border-teal-500/50';
            case 'lime':
                return isSelected ? 'bg-lime-500/30 border-lime-400' : 'bg-lime-500/20 border-lime-500/50';
            case 'green':
                return isSelected ? 'bg-green-500/30 border-green-400' : 'bg-green-500/20 border-green-500/50';
            default:
                return baseClasses;
        }
    };

    // Click anywhere on timeline to seek
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!rulerRef.current || trimmingClip) return;

        const rect = rulerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;

        setCurrentTime(Math.max(0, Math.min(duration, newTime)));
        setPlaying(false); // Pause when scrubbing
    };

    // Handle clip click
    const handleClipClick = (e: React.MouseEvent, clipId: string) => {
        e.stopPropagation();
        setSelectedClip(clipId);
    };

    // Handle clip drag
    const handleClipDrag = (clip: ClipType, trackId: number, newX: number) => {
        const trackRef = trackContentRefs.current[trackId];
        if (!trackRef) return;

        const rect = trackRef.getBoundingClientRect();
        const x = newX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newStart = percentage * duration;

        // Don't allow dragging before 0 or overlapping with other clips
        if (newStart < 0) return;

        updateClip(clip.id, { start: newStart });
    };

    // Handle trim start (left handle)
    const handleTrimStart = (e: React.MouseEvent, clip: ClipType, trackId: number) => {
        e.stopPropagation();
        setTrimmingClip({ clipId: clip.id, side: 'left' });
        setSelectedClip(clip.id);
    };

    // Handle trim end (right handle)
    const handleTrimEnd = (e: React.MouseEvent, clip: ClipType, trackId: number) => {
        e.stopPropagation();
        setTrimmingClip({ clipId: clip.id, side: 'right' });
        setSelectedClip(clip.id);
    };

    // Handle trim drag
    const handleTrimDrag = (e: MouseEvent, clip: ClipType, side: 'left' | 'right') => {
        const trackRef = trackContentRefs.current[clip.trackId];
        if (!trackRef) return;

        const rect = trackRef.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        const video = videos.find(v => v.id === clip.videoId);
        if (!video) return;

        if (side === 'left') {
            // Trimming from start
            const newStart = newTime;
            const trimDelta = newStart - clip.start;
            const newTrimStart = clip.trimStart + trimDelta;
            const newDuration = clip.duration - trimDelta;

            if (newTrimStart >= 0 && newTrimStart < clip.trimEnd && newDuration > 0) {
                updateClip(clip.id, {
                    start: newStart,
                    trimStart: newTrimStart,
                    duration: newDuration,
                });
            }
        } else {
            // Trimming from end
            const newEnd = newTime;
            const newDuration = newEnd - clip.start;
            const newTrimEnd = clip.trimStart + newDuration;

            if (newTrimEnd <= video.duration && newDuration > 0) {
                updateClip(clip.id, {
                    duration: newDuration,
                    trimEnd: newTrimEnd,
                });
            }
        }
    };

    // Clean up trim drag
    React.useEffect(() => {
        if (!trimmingClip) return;

        const handleMouseUp = () => {
            setTrimmingClip(null);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const clip = tracks
                .flatMap(t => t.clips)
                .find(c => c.id === trimmingClip.clipId);
            if (clip) {
                handleTrimDrag(e, clip, trimmingClip.side);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [trimmingClip, tracks, duration, videos]);

    return (
        <div className="h-64 bg-surface border-t border-white/10 flex flex-col shrink-0">
            {/* Timeline Header */}
            <div className="h-10 border-b border-white/10 flex items-center px-4 gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Timeline</span>
                </div>
                <div className="flex-1" />
                <button className="p-1.5 hover:bg-white/5 rounded">
                    <Grid3x3 className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            {/* Timeline Ruler - aligned with track content */}
            <div className="h-8 border-b border-white/10 bg-black/20 flex">
                {/* Empty space for track labels */}
                <div className="w-32 border-r border-white/10 shrink-0" />
                
                {/* Ruler content area */}
                <div
                    ref={rulerRef}
                    className="flex-1 relative overflow-hidden cursor-pointer"
                    onClick={handleTimelineClick}
                >
                    <div className="absolute inset-0 flex">
                        {Array.from({ length: Math.ceil(duration / 5) + 1 }).map((_, i) => {
                            const time = i * 5;
                            return (
                                <div key={i} className="flex-1 border-r border-white/5 relative">
                                    <span className="absolute top-1 left-1 text-[10px] text-zinc-600 font-mono">
                                        {formatTime(time)}
                                    </span>
                                    <div className="absolute bottom-0 left-0 w-px h-2 bg-white/20" />
                                </div>
                            );
                        })}
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute -top-1 -left-2 w-4 h-4 bg-emerald-500 rotate-45" />
                    </div>
                </div>
            </div>

            {/* Tracks */}
            <div className="flex-1 overflow-y-auto">
                {tracks.map((track, trackIndex) => (
                    <div
                        key={track.id}
                        className={`h-20 border-b border-white/5 flex relative group ${selectedTrack === trackIndex ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                            }`}
                        onClick={() => onTrackSelect(trackIndex)}
                    >
                        {/* Track Label */}
                        <div className="w-32 border-r border-white/10 p-2 flex flex-col justify-center bg-surface/50 shrink-0">
                            <div className="flex items-center gap-2">
                                {track.type === 'video' ? (
                                    <Film className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Music className="w-4 h-4 text-lime-400" />
                                )}
                                <span className="text-xs text-white truncate">{track.name}</span>
                            </div>
                        </div>

                        {/* Track Content */}
                        <div 
                            ref={el => { trackContentRefs.current[track.id] = el; }}
                            className="flex-1 relative"
                        >
                            {track.clips.map((clip) => {
                                const isSelected = selectedClipId === clip.id;
                                const isTrimming = trimmingClip?.clipId === clip.id;
                                
                                return (
                                    <div
                                        key={clip.id}
                                        className={`absolute top-2 bottom-2 rounded-md border-2 cursor-move overflow-hidden ${getColorClasses(track.color, isSelected)}`}
                                        style={{
                                            left: `${(clip.start / duration) * 100}%`,
                                            width: `${(clip.duration / duration) * 100}%`,
                                            zIndex: isSelected ? 20 : 10,
                                        }}
                                        onClick={(e) => handleClipClick(e, clip.id)}
                                        onMouseDown={(e) => {
                                            if (isTrimming) return;
                                            e.stopPropagation();
                                            const startX = e.clientX;
                                            const startLeft = clip.start;
                                            
                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                const trackRef = trackContentRefs.current[track.id];
                                                if (!trackRef) return;
                                                
                                                const rect = trackRef.getBoundingClientRect();
                                                const deltaX = moveEvent.clientX - startX;
                                                const deltaPercentage = deltaX / rect.width;
                                                const newStart = startLeft + (deltaPercentage * duration);
                                                
                                                if (newStart >= 0) {
                                                    handleClipDrag(clip, track.id, moveEvent.clientX);
                                                }
                                            };
                                            
                                            const handleMouseUp = () => {
                                                window.removeEventListener('mousemove', handleMouseMove);
                                                window.removeEventListener('mouseup', handleMouseUp);
                                            };
                                            
                                            window.addEventListener('mousemove', handleMouseMove);
                                            window.addEventListener('mouseup', handleMouseUp);
                                        }}
                                    >
                                        <div className="absolute inset-0 p-2 flex items-center pointer-events-none">
                                            <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                                        </div>

                                        {/* Waveform for audio */}
                                        {track.type === 'audio' && (
                                            <div className="absolute bottom-1 left-1 right-1 h-6 flex items-end gap-0.5 pointer-events-none">
                                                {Array.from({ length: 40 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-lime-400/50 rounded-sm"
                                                        style={{ height: `${Math.random() * 100}%` }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Left Trim Handle */}
                                        <div
                                            className={`absolute left-0 top-0 bottom-0 w-2 bg-white/80 cursor-ew-resize z-30 ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            onMouseDown={(e) => handleTrimStart(e, clip, track.id)}
                                        >
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded" />
                                        </div>

                                        {/* Right Trim Handle */}
                                        <div
                                            className={`absolute right-0 top-0 bottom-0 w-2 bg-white/80 cursor-ew-resize z-30 ${isSelected || isTrimming ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                            onMouseDown={(e) => handleTrimEnd(e, clip, track.id)}
                                        >
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
