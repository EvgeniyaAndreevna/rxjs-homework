const express = require('express');
const cors = require('cors');
const { unreadMessages, latestPosts, latestComments } = require('./data.cjs');

const app = express();
app.use(cors());
app.get('/messages/unread', (_req, res) => res.json(unreadMessages()));
app.get('/posts/latest', (_req, res) => res.json(latestPosts()));
app.get('/posts/:postId/comments/latest', (req, res) => res.json(latestComments(req.params.postId)));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'rxjs-homework-api' }));
app.use((_req, res) => res.status(404).json({ status: 'error', message: 'Endpoint not found' }));
module.exports = app;
