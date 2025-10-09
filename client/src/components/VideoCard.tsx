interface VideoProps {
    video: any;
  }
  
  export default function VideoCard({ video }: VideoProps) {
    const derivedId = video.id?.videoId || video.id || (video.videoUrl ? (() => {
      try { return new URL(video.videoUrl).searchParams.get('v'); } catch { return null; }
    })() : null);

    return (
      <div className="border rounded-lg p-4 shadow hover:shadow-lg dark:border-gray-700">
        {derivedId ? (
          <iframe
            className="w-full aspect-video rounded-md mb-2"
            src={`https://www.youtube.com/embed/${derivedId}`}
            title={video.snippet?.title || video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        ) : (
          <a href={video.videoUrl} target="_blank" rel="noreferrer">
            <img
              className="w-full aspect-video object-cover rounded-md mb-2"
              src={video.thumbnail}
              alt={video.title}
            />
          </a>
        )}
        <h3 className="text-sm font-semibold">{video.snippet?.title || video.title}</h3>
      </div>
    );
  }
  