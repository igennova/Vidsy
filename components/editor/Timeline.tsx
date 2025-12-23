"use client"
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Grid3x3, Film, Music } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface Clip {
    start: number;
    duration: number;
    name: string;
}

interface Track {
    id: number;
    name: string;
    type: 'video' | 'audio';
    color: 'emerald' | 'teal' | 'lime' | 'green';
    clips: Clip[];
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
    const { setCurrentTime, setPlaying } = useEditorStore();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'emerald':
                return 'bg-emerald-500/20 border-emerald-500/50';
            case 'teal':
                return 'bg-teal-500/20 border-teal-500/50';
            case 'lime':
                return 'bg-lime-500/20 border-lime-500/50';
            case 'green':
                return 'bg-green-500/20 border-green-500/50';
            default:
                return 'bg-emerald-500/20 border-emerald-500/50';
        }
    };

    // Click anywhere on timeline to seek
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!rulerRef.current) return;

        const rect = rulerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;

        setCurrentTime(Math.max(0, Math.min(duration, newTime)));
        setPlaying(false); // Pause when scrubbing
    };

    return (
        <div className="h-64 bg-surface border-t border-white/10 flex flex-col shrink-0">
            {/* Timeline Header */}
            <div className="h-10 border-b border-white/10 flex items-center px-4 gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Timeline</span>
                </div>
                <div className="flex-1" />
                <button className="p-1.5 hover:bg-white/5 rounded transition-all">
                    <Grid3x3 className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            {/* Timeline Ruler */}
            <div
                ref={rulerRef}
                className="h-8 border-b border-white/10 bg-black/20 relative overflow-hidden cursor-pointer"
                onClick={handleTimelineClick}
            >
                <div className="absolute inset-0 flex">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="flex-1 border-r border-white/5 relative">
                            <span className="absolute top-1 left-1 text-[10px] text-zinc-600 font-mono">
                                {formatTime(i * 5)}
                            </span>
                            <div className="absolute bottom-0 left-0 w-px h-2 bg-white/20" />
                        </div>
                    ))}
                </div>

                {/* Playhead - Simple, no drag */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                    <div className="absolute -top-1 -left-2 w-4 h-4 bg-emerald-500 rotate-45" />
                </div>
            </div>

            {/* Tracks */}
            <div className="flex-1 overflow-y-auto">
                {tracks.map((track, trackIndex) => (
                    <div
                        key={track.id}
                        className={`h-16 border-b border-white/5 flex relative group ${selectedTrack === trackIndex ? 'bg-white/5' : 'hover:bg-white/[0.02]'
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
                        <div className="flex-1 relative">
                            {track.clips.map((clip, clipIndex) => (
                                <motion.div
                                    key={clipIndex}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 500 }}
                                    whileHover={{ scale: 1.02, zIndex: 10 }}
                                    className={`absolute top-2 bottom-2 rounded-md border-2 cursor-move overflow-hidden ${getColorClasses(track.color)}`}
                                    style={{
                                        left: `${(clip.start / duration) * 100}%`,
                                        width: `${(clip.duration / duration) * 100}%`,
                                    }}
                                >
                                    <div className="absolute inset-0 p-2 flex items-center">
                                        <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                                    </div>

                                    {/* Waveform for audio */}
                                    {track.type === 'audio' && (
                                        <div className="absolute bottom-1 left-1 right-1 h-6 flex items-end gap-0.5">
                                            {Array.from({ length: 40 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-lime-400/50 rounded-sm"
                                                    style={{ height: `${Math.random() * 100}%` }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Resize Handles */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
