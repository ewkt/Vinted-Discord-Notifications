//create the articles table and initialize the processedArticleIds set
export function init(db, processedArticleIds) {
    db.exec(`CREATE TABLE IF NOT EXISTS articles(
        id INTEGER PRIMARY KEY,
        search TEXT,
        title TEXT,
        price TEXT,
        size TEXT,
        seller TEXT,
        url TEXT,
        photoUrl TEXT,
        timestamp DATETIME
    )`);
    const dbArticles = db.prepare('SELECT * FROM articles').all();
    dbArticles.forEach(article => { processedArticleIds.add(article.id); });
  }

//function to insert articles into the database
export function insertArticles(articles, searchName, db) {
    const insert = db.prepare('INSERT INTO articles(id, search, title, price, size, seller, url, photoUrl, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const select = db.prepare('SELECT 1 FROM articles WHERE id = ?');

    for (const article of articles) {
      if (!select.get(article.id)) {
          const { id, title, price, size_title, user, url, photo } = article;
          const timestamp = new Date().toISOString(); // Get the current timestamp in ISO format
          insert.run(id, searchName, title, price, size_title, user.id, url, photo.url,timestamp);
        }
      }
  }