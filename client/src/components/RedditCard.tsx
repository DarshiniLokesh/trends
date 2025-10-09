interface RedditProps {
    post: any;
  }
  
  export default function RedditCard({ post }: RedditProps) {
    return (
      <div className="border rounded-lg p-4 shadow hover:shadow-lg dark:border-gray-700">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span>r/{post.subreddit}</span>
          <span>⬆️ {post.ups}</span>
        </div>
        <h3 className="font-semibold mb-2">{post.title}</h3>
  
        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt=""
            className="w-full h-40 object-cover rounded-md mb-2"
          />
        )}
  
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 text-sm"
        >
          View on Reddit →
        </a>
      </div>
    );
  }
  