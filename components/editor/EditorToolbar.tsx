"use client"
import React from 'react';
import {
    Scissors, Copy, Trash2, Download, Upload, Save, Undo2, Redo2,
    Type, Music, Image, Crop, RotateCw, Filter, Settings
} from 'lucide-react';

interface EditorToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    onImport: () => void;
    onExport: () => void;
    onSplit: () => void;
    onDelete: () => void;
    canSplit: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onUndo,
    onRedo,
    onImport,
    onExport,
    onSplit,
    onDelete,
    canSplit
}) => {
    return (
        <div className="h-14 bg-surface border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
            <div className="flex items-center gap-2">
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
                    Lumina
                </div>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-sm text-zinc-400">Untitled Project</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2">
                <ToolButton icon={Undo2} tooltip="Undo" onClick={onUndo} />
                <ToolButton icon={Redo2} tooltip="Redo" onClick={onRedo} />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <ToolButton 
                    icon={Scissors} 
                    tooltip="Split at playhead (S)" 
                    onClick={onSplit}
                    active={canSplit}
                    disabled={!canSplit}
                />
                <ToolButton icon={Copy} tooltip="Duplicate" />
                <ToolButton icon={Trash2} tooltip="Delete selected clip" onClick={onDelete} />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <ToolButton icon={Crop} tooltip="Crop" />
                <ToolButton icon={RotateCw} tooltip="Rotate" />
                <ToolButton icon={Filter} tooltip="Effects" />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <ToolButton icon={Type} tooltip="Text" />
                <ToolButton icon={Music} tooltip="Audio" />
                <ToolButton icon={Image} tooltip="Media" />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onImport}
                    className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 border border-white/10 transition-all flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Import
                </button>
                <button
                    onClick={onExport}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const ToolButton = ({ icon: Icon, tooltip, active = false, onClick, disabled = false }: {
    icon: any;
    tooltip: string;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all relative group ${
            disabled 
                ? 'opacity-30 cursor-not-allowed text-zinc-600'
                : active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-white/5 text-zinc-400 hover:text-white'
        }`}
        title={tooltip}
    >
        <Icon className="w-5 h-5" />
    </button>
);

export default EditorToolbar;
