//create the articles table and initialize the processedArticleIds set
function init(db, processedArticleIds) {
    db.exec(`CREATE TABLE IF NOT EXISTS articles(
        id INTEGER PRIMARY KEY,
        search TEXT,
        title TEXT,
        price TEXT,
        size TEXT,
        seller TEXT,
        url TEXT,
        photoUrl TEXT,
        date DATETIME,
        timestamp INTEGER,
        sold BOOLEAN
    )`);
    const dbArticles = db.prepare('SELECT * FROM articles').all();
    dbArticles.forEach(article => { processedArticleIds.add(`${article.id}_${article.timestamp}`); });
}

//function to insert articles into the database
function insertArticles(articles, searchName, db) {
    const insert = db.prepare('INSERT INTO articles(id, search, title, price, size, seller, url, photoUrl, date, timestamp, sold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const select = db.prepare('SELECT 1 FROM articles WHERE id = ?');

    for (const article of articles) {
      if (!select.get(article.id)) {
          const { id, title, price, size_title, user, url, photo } = article;
          const date = new Date().toISOString();
          const timestamp = article.photo.high_resolution.timestamp
          const sold = 0;
          insert.run(id, searchName, title, price, size_title, user.id, url, photo.url, date, timestamp, sold);
        }
      }
}

export { init, insertArticles };