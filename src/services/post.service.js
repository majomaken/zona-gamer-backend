import { ObjectId } from "mongodb";
import { getDB } from "../db.js"

export const getPostById = async (postId) => {
  const db = getDB();
  const postsCollection = db.collection('posts');
  const post = await postsCollection.findOne(
    { 
      _id: postId,
      isActive: true,
    },
  )
  
  if (!post) {
    return null;
  }

  return post;
}

export const createPost = async (postData, userId) => {
  const db = getDB();
  const postsCollection = db.collection('posts');

  const newPost = {
    title: postData.title,
    description: postData.description,
    content: postData.content,
    image: postData.image,
    type: postData.type,
    category: postData.category,
    tags: postData.tags,
    isActive: true,
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    author: {
      userId: new ObjectId(userId),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await postsCollection.insertOne(newPost);

  const post = await getPostById(result.insertedId);

  return post;
}