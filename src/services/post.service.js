import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

export const getPostById = async (postId) => {
  const db = getDB();
  const postsCollection = db.collection("posts");
  const usersCollection = db.collection("users");

  const post = await postsCollection.findOne({
    _id: new ObjectId(postId),
    isActive: true,
  });

  if (!post) {
    return null;
  }

  const author = await usersCollection.findOne(
    { _id: new ObjectId(post.author?.userId) },
    {
      projection: {
        name: 1,
        email: 1,
        _id: 1,
      }
    }
  );


  return {
    ...post,
    author: {
      name: author?.name ?? "Anónimo",
      email: author?.email ?? "email@eliminado.com",
    }
  };
};

export const createPost = async (postData, userId) => {
  const db = getDB();
  const postsCollection = db.collection("posts");

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
};

export const getPosts = async (filters) => {
  const db = getDB();
  const postsCollection = db.collection("posts");
  const usersCollection = db.collection("users");

  const {
    page = 1,
    limit = 10,
    category,
    tags = [],
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query = { isActive: true };
  if (category) query.category = category;
  if (tags.length > 0) query.tags = { $in: tags };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i'} },
      { description: { $regex: search, $options: 'i'} },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const posts = await postsCollection
    .find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .toArray();

  const userIds = [...new Set(posts.map(post => post.author?.userId?.toString()))];
  const users = await usersCollection.find(
    { _id: { $in: userIds.map(id => new ObjectId(id)) } },
    { projection: { name: 1, email: 1, _id: 1 } }
  ).toArray();

  const usersMap = new Map(users.map(user => [user._id.toString(), user]));

  const populatedPosts = posts.map(post => ({
    ...post,
    author: {
      name: usersMap.get(post.author?.userId?.toString())?.name ?? "Anónimo",
      email: usersMap.get(post.author?.userId?.toString())?.email ?? "email@eliminado.com",
    }
  }))

  const totalPosts = await postsCollection.countDocuments(query);
  const totalPages = Math.ceil(totalPosts / limit);

  return {
    posts: populatedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
