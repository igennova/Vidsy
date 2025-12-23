"use client"
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';

const Hero: React.FC = () => {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const toggleAudio = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <section className="relative pt-32 md:pt-48 pb-16 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-lime-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8 backdrop-blur-sm"
                >
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    v2.0 is now live in public beta
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
                >
                    Edit videos.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400">
                        Directly in your browser.
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
                >
                    The power of a desktop editor, without the downloads. Open source, privacy-focused, and powered by WebAssembly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <button className="h-12 px-8 rounded-full bg-white text-black font-semibold text-lg hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        Start Editing
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="h-12 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* Floating UI Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="mt-20 w-full max-w-5xl rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-lime-500/5 pointer-events-none z-20" />

                    {/* Window Controls */}
                    <div className="h-8 border-b border-white/10 bg-black/80 flex items-center px-4 gap-2 relative z-30">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                            <div className="w-3 h-3 rounded-full bg-white/20" />
                        </div>
                        <div className="ml-auto text-xs text-zinc-500 font-mono">Lumina_Project_v2.lum</div>
                    </div>

                    <div className="aspect-[16/9] relative flex items-center justify-center bg-black group">

                        {/* The Video Element */}
                        {/* Note: Autoplay requires muted to be true initially in most browsers */}
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        >
                            <source src="https://res.cloudinary.com/dtoziahfz/video/upload/v1765619958/Gojo_Edit_10_Hours_720p_hi1zhz.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Dark overlay to ensure the editor UI pops even if video is bright */}
                        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                        {/* Audio Toggle Button */}
                        <button
                            onClick={toggleAudio}
                            className="absolute bottom-36 right-4 z-40 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-emerald-500 hover:text-white transition-all backdrop-blur-sm"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        {/* Faux Editor Interface Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-32 border-t border-white/10 bg-zinc-950/90 flex flex-col p-2 backdrop-blur-sm z-30">
                            {/* Faux Timeline */}
                            <div className="h-6 w-full flex items-end gap-1 mb-2 px-2">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-full bg-zinc-800 rounded-sm" style={{ height: `${Math.random() * 100}%` }} />
                                ))}
                            </div>
                            <div className="flex-1 flex gap-2 overflow-hidden px-2">
                                <motion.div
                                    className="h-full bg-emerald-500/20 border border-emerald-500/40 rounded-md w-1/3 relative"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-emerald-300 font-medium tracking-widest">GOJO.MP4</div>
                                </motion.div>
                                <motion.div
                                    className="h-full bg-teal-500/20 border border-teal-500/40 rounded-md w-1/4 relative"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-teal-300 font-medium tracking-widest">INTRO_ANIM</div>
                                </motion.div>
                                <motion.div
                                    className="h-full bg-lime-500/20 border border-lime-500/40 rounded-md w-1/4 relative"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-lime-300 font-medium tracking-widest">AUDIO_SFX</div>
                                </motion.div>
                            </div>
                            {/* Playhead */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                animate={{ left: ["10%", "60%", "10%"] }}
                                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                            >
                                <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
                            </motion.div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;