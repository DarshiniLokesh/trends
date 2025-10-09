interface NewsProps {
  article: any;
}

export default function NewsCard({ article }: NewsProps) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
      <p className="text-sm mb-3">{article.description}</p>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 text-sm"
      >
        Read more →
      </a>
    </div>
  );
}
