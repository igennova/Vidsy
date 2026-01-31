"use client"
import React, { useState } from 'react';
import { Search, Film, Filter, Palette, Sparkles, Zap, Music, Play, Star, Plus, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';

type TabType = 'media' | 'effects' | 'text' | 'audio';

const AssetLibrary: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('media');
    const { videos, removeVideo, addClipToTimeline } = useEditorStore();

    const effects = [
        { name: 'Blur', icon: Filter },
        { name: 'Glow', icon: Sparkles },
        { name: 'Color Grade', icon: Palette },
        { name: 'Chromatic', icon: Zap },
    ];

    const handleAddToTimeline = (videoId: string) => {
        addClipToTimeline(videoId, 1); // Add to first video track
        toast.success('Video added to timeline!');
    };

    const handleDeleteVideo = (videoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeVideo(videoId);
        toast.success('Video removed');
    };

    return (
        <div className="w-72 bg-surface border-r border-white/10 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {(['media', 'effects', 'text', 'audio'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium capitalize relative ${activeTab === tab
                                ? 'text-emerald-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeTab === 'media' && (
                    <div className="grid grid-cols-2 gap-2">
                        {videos.length === 0 ? (
                            <div className="col-span-2 text-center py-8">
                                <Film className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">No videos uploaded</p>
                                <p className="text-xs text-zinc-600 mt-1">Click Import to add videos</p>
                            </div>
                        ) : (
                            videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="aspect-video bg-black/50 border border-white/10 rounded-lg overflow-hidden cursor-pointer group relative"
                                    onClick={() => handleAddToTimeline(video.id)}
                                >
                                        {/* Thumbnail */}
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-lime-500/20" />
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                            <Plus className="w-8 h-8 text-emerald-400" />
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteVideo(video.id, e)}
                                            className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded opacity-0 group-hover:opacity-100 z-10"
                                        >
                                            <Trash2 className="w-3 h-3 text-white" />
                                        </button>

                                        {/* Video Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-xs text-white truncate">{video.name}</p>
                                            <p className="text-[10px] text-zinc-400">
                                                {Math.round(video.duration)}s • {(video.size / 1024 / 1024).toFixed(1)}MB
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                    </div>
                )}

                {activeTab === 'effects' && (
                    <div className="space-y-2">
                        {effects.map((effect, i) => (
                            <button
                                key={i}
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg hover:border-emerald-500/50 flex items-center gap-3 group"
                            >
                                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20">
                                    <effect.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-sm text-zinc-300 group-hover:text-white">{effect.name}</span>
                                <Star className="w-4 h-4 text-zinc-600 ml-auto" />
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="space-y-2">
                        {['Title', 'Subtitle', 'Lower Third', 'Credits'].map((preset, i) => (
                            <button
                                key={i}
                                className="w-full p-4 bg-black/30 border border-white/10 rounded-lg hover:border-emerald-500/50"
                            >
                                <p className="text-sm text-zinc-300 text-left">{preset}</p>
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'audio' && (
                    <div className="space-y-2">
                        {['Whoosh', 'Impact', 'Transition', 'Ambient'].map((sound, i) => (
                            <button
                                key={i}
                                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg hover:border-emerald-500/50 flex items-center gap-3"
                            >
                                <Music className="w-5 h-5 text-lime-400" />
                                <span className="text-sm text-zinc-300">{sound}.wav</span>
                                <Play className="w-4 h-4 text-zinc-600 ml-auto" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetLibrary;
