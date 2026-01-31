"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useEditorStore } from '@/stores/editorStore';
import EditorToolbar from '@/components/editor/EditorToolbar';
import AssetLibrary from '@/components/editor/AssetLibrary';
import VideoPreview from '@/components/editor/VideoPreview';
import PlaybackControls from '@/components/editor/PlaybackControls';
import Timeline from '@/components/editor/Timeline';
import UploadModal from '@/components/editor/UploadModal';
import { exportVideo, downloadVideo } from '@/services/exportService';

const EditorPage = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);

    const {
        tracks,
        videos,
        isPlaying,
        currentTime,
        duration,
        selectedTrackId,
        selectedClipId,
        zoom,
        setPlaying,
        setSelectedTrack,
        setZoom,
        splitClip,
        removeClip,
    } = useEditorStore();

    const handleTogglePlay = () => {
        setPlaying(!isPlaying);
    };

    const handleUndo = () => {
        console.log('Undo');
    };

    const handleRedo = () => {
        console.log('Redo');
    };

    const handleImport = () => {
        setShowUploadModal(true);
    };

    const handleExport = async () => {
        // Check if there are any clips to export
        const hasClips = tracks.some(track => track.clips.length > 0);

        if (!hasClips) {
            toast.error('No clips to export. Add videos to the timeline first.');
            return;
        }

        const toastId = toast.loading('Preparing export...', {
            description: 'Loading FFmpeg (first time may take longer)'
        });

        try {
            // Start the export process
            toast.loading('Processing video...', {
                id: toastId,
                description: 'This may take a while for large videos'
            });

            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += 5;
                    toast.loading(`Exporting... ${progress}%`, { id: toastId });
                }
            }, 1000);

            const blob = await exportVideo(tracks, videos, (exportProgress) => {
                progress = exportProgress;
                toast.loading(`Exporting... ${Math.round(exportProgress)}%`, { id: toastId });
            });

            clearInterval(progressInterval);

            downloadVideo(blob, 'edited-video.mp4');

            toast.success('Video exported successfully!', { id: toastId });
        } catch (error: any) {
            toast.error(error?.message || 'Export failed. Please try again.', { id: toastId });
            console.error('Export error:', error);
        }
    };

    const handleZoomIn = () => {
        setZoom(zoom + 0.25);
    };

    const handleZoomOut = () => {
        setZoom(zoom - 0.25);
    };

    const handleTrackSelect = (index: number) => {
        setSelectedTrack(index);
    };

    const handleSplit = useCallback(() => {
        // Find clip at current time
        for (const track of tracks) {
            for (const clip of track.clips) {
                const clipStart = clip.start;
                const clipEnd = clip.start + clip.duration;

                if (currentTime >= clipStart && currentTime < clipEnd) {
                    splitClip(clip.id, currentTime);
                    return;
                }
            }
        }
    }, [tracks, currentTime, splitClip]);

    const handleDelete = useCallback(() => {
        if (selectedClipId) {
            removeClip(selectedClipId);
        }
    }, [selectedClipId, removeClip]);

    // Convert tracks to the format Timeline expects (with full clip data)
    const timelineTracks = tracks.map(track => ({
        ...track,
        color: track.id === 1 ? 'emerald' as const :
            track.id === 2 ? 'teal' as const :
                track.id === 3 ? 'lime' as const : 'green' as const,
    }));

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Split on 'S' key
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                handleSplit();
            }

            // Delete on Delete/Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
                e.preventDefault();
                handleDelete();
            }

            // Spacebar to play/pause
            if (e.key === ' ') {
                e.preventDefault();
                handleTogglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedClipId, handleSplit, handleDelete, handleTogglePlay]);

    return (
        <>
            <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
                {/* Top Toolbar */}
                <EditorToolbar
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onImport={handleImport}
                    onExport={handleExport}
                    onSplit={handleSplit}
                    onDelete={handleDelete}
                    canSplit={!!selectedClipId}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Assets & Tools */}
                    <AssetLibrary />

                    {/* Center - Preview & Timeline */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Video Preview */}
                        <VideoPreview
                            isPlaying={isPlaying}
                            currentTime={currentTime}
                            duration={duration}
                            onTogglePlay={handleTogglePlay}
                        />

                        {/* Playback Controls */}
                        <PlaybackControls
                            isPlaying={isPlaying}
                            zoom={zoom}
                            onTogglePlay={handleTogglePlay}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                        />

                        {/* Timeline */}
                        <Timeline
                            tracks={timelineTracks}
                            currentTime={currentTime}
                            duration={duration}
                            selectedTrack={selectedTrackId}
                            onTrackSelect={handleTrackSelect}
                        />
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <UploadModal onClose={() => setShowUploadModal(false)} />
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <Toaster
                position="bottom-right"
                theme="dark"
                toastOptions={{
                    style: {
                        background: '#050A05',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                    },
                }}
            />
        </>
    );
};

export default EditorPage;
