//chooses only articles not already seen & posted in the last hour
const filterArticles = (articles, processedArticleIds) => {
  const filteredArticles = articles.filter(({ photo, id }) => 
    photo && photo.high_resolution.timestamp * 1000 > Date.now() - 3600000 && !processedArticleIds.has(id)
  );
  return filteredArticles;
};

//fetches new articles with the search and returns them
async function selectNewArticles(articles, processedArticleIds) {
  const items = Array.isArray(articles.items) ? articles.items : [];
  const newArticles = filterArticles(items, processedArticleIds);
  return newArticles;
}

export default selectNewArticles;