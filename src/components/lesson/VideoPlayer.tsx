'use client';

export function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-black aspect-video">
      <iframe
        src={url}
        title="Lesson video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
