const express = require("express");
const cors = require("cors");
const {
  getCategories,
  getReviews,
  getReviewsById,
  getReviewIdComments,
  postComment,
  deleteComment,
  patchComment,
  getUsers,
  getApi,
} = require("./controllers/app-controllers");
const {
  handle404,
  handleCustom,
  handleCustomErr,
  handle500Err,
} = require("./controllers/error-controllers");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api", getApi);

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewsById);

app.get("/api/reviews/:review_id/comments", getReviewIdComments);

app.get("/api/users", getUsers);

app.post("/api/reviews/:review_id/comments", postComment);

app.patch("/api/reviews/:review_id", patchComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.use(handle404);

app.use(handleCustom);

app.use(handleCustomErr);

app.use(handle500Err);

module.exports = app;
