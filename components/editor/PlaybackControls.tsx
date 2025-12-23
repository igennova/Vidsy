"use client"
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

interface PlaybackControlsProps {
    isPlaying: boolean;
    zoom: number;
    onTogglePlay: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    isPlaying,
    zoom,
    onTogglePlay,
    onZoomIn,
    onZoomOut
}) => {
    return (
        <div className="h-16 bg-surface border-t border-white/10 flex items-center justify-center gap-4 px-4 shrink-0">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400 hover:text-white">
                <SkipBack className="w-5 h-5" />
            </button>
            <button
                onClick={onTogglePlay}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
            >
                {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                ) : (
                    <Play className="w-6 h-6 text-white" />
                )}
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400 hover:text-white">
                <SkipForward className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-zinc-400" />
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Zoom:</span>
                <button
                    onClick={onZoomOut}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-zinc-400 hover:text-white transition-all"
                >
                    -
                </button>
                <span className="text-xs text-white font-mono w-12 text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={onZoomIn}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-zinc-400 hover:text-white transition-all"
                >
                    +
                </button>
            </div>

            <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400 hover:text-white">
                <Maximize2 className="w-5 h-5" />
            </button>
        </div>
    );
};

export default PlaybackControls;
