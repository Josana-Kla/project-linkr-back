import {
  insertPost,
  insertTag,
  checkTag,
  updateTag,
  insertHashPost,
  listOfPosts,
  findPost,
  deletePost,
  deleteTag,
  deleteHash,
  editPost,
  likePost,
  unlikePost,
  userLikes,
} from "../repositories/posts.repositories.js";

export async function newPost(req, res) {
  const newPost = req.post;
  let hashs;
  if (newPost.content) {
    hashs = newPost.content.match(/#\w+/g);
  }

  try {
    const postId = await insertPost(newPost);

    if (hashs) {
      hashs.forEach(async (hash) => {
        const hashExists = await checkTag(hash);
        if (hashExists.rows[0]) {
          await updateTag(hash);
          await insertHashPost(postId.rows[0].id, hashExists.rows[0].id);
        } else {
          const tagId = await insertTag(hash);
          await insertHashPost(postId.rows[0].id, tagId.rows[0].id);
        }
      });
    }

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getAllPosts(req, res) {
  try {
    const { rows } = await listOfPosts();

    return res.send(rows);
  } catch (error) {
    res.send(error);
  }
}

export async function removePost(req, res) {
  const { id } = req.params;

  try {
    const { rows: post } = await findPost(id);

    if (post[0] !== undefined) {
      if (post[0].content) {
        const hashs = post[0].content.match(/#\w+/g);
        if (hashs) {
          hashs.forEach(async (hash) => {
            await deleteTag(hash);
          });
        }
      }
      await deleteHash(id);
      await deletePost(id);
      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);

    return res.status(500).send(err);
  }
}

export async function putPost(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  const newHashs = content?.match(/#\w+/g);

  try {
    const { rows: post } = await findPost(id);

    if (post[0] !== undefined) {
      if (post[0].content) {
        const hashs = post[0].content.match(/#\w+/g);
        if (hashs) {
          hashs.forEach(async (hash) => {
            await deleteTag(hash);
          });
        }
      }
      await deleteHash(id);

      await editPost(id, content);

      if (newHashs) {
        newHashs.forEach(async (hash) => {
          const hashExists = await checkTag(hash);
          if (hashExists.rows[0]) {
            await updateTag(hash);
            await insertHashPost(id, hashExists.rows[0].id);
          } else {
            const tagId = await insertTag(hash);
            await insertHashPost(id, tagId.rows[0].id);
          }
        });
      }

      return res.sendStatus(200);
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
}

export async function insertLike(req, res) {
  const postid = req.params.id;
  const userId = req.user.id;

  try {
    await likePost(userId, postid);
    return res.sendStatus(201);
  } catch (error) {
    res.send(error);
  }
}

export async function removeLike(req, res) {
  const postid = req.params.id;
  const userId = req.user.id;
  try {
    await unlikePost(userId, postid);
    return res.sendStatus(201);
  } catch (error) {
    res.send(error);
  }
}

export async function getUserLikes(req, res) {
  const userId = req.user.id;
  try {
    const { rows } = await userLikes(userId);
    return res.send(rows);
  } catch (error) {
    res.send(error);
  }
}
