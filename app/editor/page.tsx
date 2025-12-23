"use client"
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useEditorStore } from '@/stores/editorStore';
import EditorToolbar from '@/components/editor/EditorToolbar';
import AssetLibrary from '@/components/editor/AssetLibrary';
import VideoPreview from '@/components/editor/VideoPreview';
import PlaybackControls from '@/components/editor/PlaybackControls';
import Timeline from '@/components/editor/Timeline';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import UploadModal from '@/components/editor/UploadModal';

const EditorPage = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);

    const {
        tracks,
        isPlaying,
        currentTime,
        duration,
        selectedTrackId,
        zoom,
        setPlaying,
        setSelectedTrack,
        setZoom,
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

    const handleExport = () => {
        console.log('Export');
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

    // Convert tracks to the format Timeline expects
    const timelineTracks = tracks.map(track => ({
        ...track,
        color: track.id === 1 ? 'emerald' as const :
            track.id === 2 ? 'teal' as const :
                track.id === 3 ? 'lime' as const : 'green' as const,
        clips: track.clips.map(clip => ({
            start: clip.start,
            duration: clip.duration,
            name: clip.name,
        }))
    }));

    return (
        <>
            <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
                {/* Top Toolbar */}
                <EditorToolbar
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onImport={handleImport}
                    onExport={handleExport}
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

                    {/* Right Sidebar - Properties & Layers */}
                    <PropertiesPanel />
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
