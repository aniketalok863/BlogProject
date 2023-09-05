const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files (e.g., styles.css)

const { Pool } = require('pg');
const pool = new Pool({
  user: 'aniketalok',
  host: 'localhost',
  database: 'BlogPlatform',
  password: 'root',
  port: 5432,
});

pool.on('error', (err, client) => {
  console.error('Error:', err);
});

// Configure Express to use EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM blogs');
    const blogs = result.rows;
    client.release();

    res.render('index', { blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// app.get('/blog/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const client = await pool.connect();
//     const result = await client.query('SELECT * FROM blogs WHERE id = $1', [id]);
//     const blog = result.rows[0];
//     client.release();

//     res.render('blog', { blog });
//   } catch (error) {
//     console.error('Error fetching blog:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', async (req, res) => {
  const { title, content } = req.body;

  try {
    const client = await pool.connect();
    await client.query('INSERT INTO blogs (title, content) VALUES ($1, $2)', [title, content]);
    client.release();

    res.redirect('/');
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/blog/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM comments WHERE blog_id = $1', [id]);
    const comments = result.rows;
    client.release();

    res.render('blog', { comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/blog/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM blogs WHERE id = $1', [id]);
      const blog = result.rows[0];
  
      // Fetch comments for the blog
      const commentResult = await client.query('SELECT * FROM comments WHERE blog_id = $1', [id]);
      const comments = commentResult.rows;
  
      client.release();
  
      res.render('blog', { blog, comments }); // Pass both blog and comments to the template
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.post('/blog/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const client = await pool.connect();
    await client.query('INSERT INTO comments (blog_id, content) VALUES ($1, $2)', [id, content]);
    client.release();

    res.redirect(`/blog/${id}`);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
