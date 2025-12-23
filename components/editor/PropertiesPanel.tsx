"use client"
import React from 'react';
import { Move, Eye, Sparkles, Palette, Wand2, Save, Plus, Sliders, Trash2 } from 'lucide-react';

const PropertiesPanel: React.FC = () => {
    return (
        <div className="w-80 bg-surface border-l border-white/10 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button className="flex-1 py-3 text-sm font-medium text-emerald-400 relative">
                    Properties
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                </button>
                <button className="flex-1 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-all">
                    Layers
                </button>
            </div>

            {/* Properties Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Transform */}
                <PropertySection title="Transform" icon={Move}>
                    <PropertySlider label="Position X" value={0} />
                    <PropertySlider label="Position Y" value={0} />
                    <PropertySlider label="Scale" value={100} unit="%" />
                    <PropertySlider label="Rotation" value={0} unit="°" />
                </PropertySection>

                {/* Opacity */}
                <PropertySection title="Opacity" icon={Eye}>
                    <PropertySlider label="Opacity" value={100} unit="%" />
                    <PropertySlider label="Blend Mode" value={0} />
                </PropertySection>

                {/* Effects */}
                <PropertySection title="Effects" icon={Sparkles}>
                    <div className="space-y-2">
                        <EffectChip name="Gaussian Blur" active />
                        <EffectChip name="Color Correction" />
                        <button className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Effect
                        </button>
                    </div>
                </PropertySection>

                {/* Color */}
                <PropertySection title="Color" icon={Palette}>
                    <PropertySlider label="Brightness" value={0} />
                    <PropertySlider label="Contrast" value={0} />
                    <PropertySlider label="Saturation" value={0} />
                    <PropertySlider label="Hue" value={0} unit="°" />
                </PropertySection>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-white/10 space-y-2">
                <button className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 font-medium transition-all flex items-center justify-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Auto Enhance
                </button>
                <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 font-medium transition-all flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Preset
                </button>
            </div>
        </div>
    );
};

// Helper Components
const PropertySection = ({ title, icon: Icon, children }: {
    title: string;
    icon: any;
    children: React.ReactNode
}) => (
    <div className="space-y-3">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-3 pl-6">
            {children}
        </div>
    </div>
);

const PropertySlider = ({ label, value, unit = '' }: {
    label: string;
    value: number;
    unit?: string
}) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">{label}</label>
            <span className="text-xs text-white font-mono">{value}{unit}</span>
        </div>
        <input
            type="range"
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-emerald-400"
        />
    </div>
);

const EffectChip = ({ name, active = false }: { name: string; active?: boolean }) => (
    <div className={`p-2 rounded-lg border flex items-center justify-between group ${active
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-white/5 border-white/10'
        }`}>
        <span className="text-xs text-white">{name}</span>
        <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-white/10 rounded transition-all">
                <Sliders className="w-3 h-3 text-zinc-400" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded transition-all">
                <Trash2 className="w-3 h-3 text-zinc-400" />
            </button>
        </div>
    </div>
);

export default PropertiesPanel;
