import axios from "axios";

const NEWS_API_KEY = "dd9f970503fd4ac4ad12e26952c7bbed";

export async function fetchLatestNews(topic = "technology") {
  const url = `https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&language=fr&pageSize=3&apiKey=${NEWS_API_KEY}`;

  const response = await axios.get(url);
  return response.data.articles.map(
    (a: any) => `- ${a.title} (${a.source.name})`
  );
}
