import Hero from "@/components/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <main className="flex flex-col gap-24 pb-24"></main>
      <Hero />
    </div>

  );
}

