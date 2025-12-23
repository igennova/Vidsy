"use client"
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Plus } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';

const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addVideo } = useEditorStore();
    const [isDragging, setIsDragging] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState('');

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);

        try {
            // Process files one at a time to avoid freezing
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(`Processing ${i + 1} of ${files.length}: ${file.name}...`);

                // Small delay to let UI update
                await new Promise(resolve => setTimeout(resolve, 50));

                await addVideo(file);
            }

            toast.success(`Successfully uploaded ${files.length} video(s)!`);
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to upload video. Please try again.');
            console.error(error);
        } finally {
            setIsUploading(false);
            setUploadProgress('');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-2xl p-8 max-w-2xl w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Upload Video</h2>
                    <p className="text-sm text-zinc-400">
                        Upload your video files to start editing
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-12 transition-all ${isDragging
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/20 hover:border-white/30'
                        }`}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isDragging
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/5 text-zinc-400'
                            }`}>
                            <Upload className="w-8 h-8" />
                        </div>

                        <div className="text-center">
                            <p className="text-white font-medium mb-1">
                                {isDragging ? 'Drop your videos here' : 'Drag & drop videos here'}
                            </p>
                            <p className="text-sm text-zinc-500">or</p>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {isUploading ? 'Processing...' : 'Browse Files'}
                        </button>

                        {isUploading && uploadProgress && (
                            <div className="mt-2 text-sm text-emerald-400 animate-pulse">
                                {uploadProgress}
                            </div>
                        )}

                        <p className="text-xs text-zinc-600">
                            Supports: MP4, WebM, MOV, AVI (Max 500MB)
                        </p>
                    </div>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </motion.div>
        </motion.div>
    );
};

export default UploadModal;
