export function NewsFeed({ news }: { news: string[] }) {
  return (
    <section className="panel">
      <p className="eyebrow">Срочные новости</p>
      {news.length === 0 ? (
        <p className="empty-news">Срочных новостей нет.</p>
      ) : (
        <ul className="news">
          {news.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
