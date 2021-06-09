const express = require('express');
const postsRouter = express.Router();

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

//   res.send({ message: 'hello from /users!' });

  next();
});

const {getAllPosts} = require('../db')

postsRouter.get('/', async(req, res) => {

    const allPosts = await getAllPosts();

    res.send({
      allPosts
    });
  });

module.exports = postsRouter;