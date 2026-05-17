import { TopBar } from "@/components/TopBar";

export default function AboutPage() {
  return (
    <>
      <TopBar title="关于织间" showBell={false} />
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="text-6xl mb-6">🧵</div>
        <h1 className="text-2xl font-bold mb-8">织间</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          每一个功能，都在编织属于你们的时间。
        </p>
        <p className="text-xs text-muted-foreground mt-8">v1.0.0</p>
      </div>
    </>
  );
}
