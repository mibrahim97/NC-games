const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const connection = require("../db/connection");
const data = require("../db/data/test-data/index");

beforeEach(() => {
  return seed(data);
});
afterAll(() => {
  return connection.end();
});

describe("app", () => {
  test("should give a 404 error + correct message for invalid path", () => {
    return request(app)
      .get("/api/does-not-exist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Try again - Path not found!!!");
      });
  });
});

describe("GET API/categories", () => {
  test("should return 200 status & an object with keys of description and slug", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        expect(body.categories).toHaveLength(4);
        body.categories.forEach((category) => {
          expect(category).toHaveProperty("description");
          expect(category).toHaveProperty("slug");
        });
      });
  });
});

describe("GET API/reviews", () => {
  test("should return 200 status & an object with the corresponding keys in descending order (by date) with the correct data type", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        body.reviews.forEach((review) => {
          expect(review).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            review_body: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
            category: expect.any(String),
          });
        });

        expect(body.reviews).toBeSorted("created_at", { descending: true });
      });
  });
});

describe("GET API/reviews/:review_id", () => {
  test("should return 200 status & 1 review object with correct corresponding ID", () => {
    const reviewId = 1;
    return request(app)
      .get(`/api/reviews/${reviewId}`)
      .expect(200)
      .then(({ body }) => {
        expect(reviewId).toBe(1);
        expect(body.review).toMatchObject({
          owner: expect.any(String),
          title: expect.any(String),
          review_id: expect.any(Number),
          review_body: expect.any(String),
          review_img_url: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          designer: expect.any(String),
          category: expect.any(String),
        });
      });
  });
  test("should get 404 if given an ID which does not exist...yet", () => {
    const reviewId = 1001;
    return request(app)
      .get(`/api/reviews/${reviewId}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          `Try again - ID ${reviewId} does not exist yet!!!`
        );
      });
  });

  test("should get 400 error if given bad path/invalid syntax ", () => {
    const reviewId = "orange";
    return request(app)
      .get(`/api/reviews/${reviewId}`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "bad request" });
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("should respond with an array of comments for the given review_id of which each comment should have the given properties", () => {
    const reviewId = 2;
    return request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeInstanceOf(Array);
        body.comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("review_id");
        });
      });
  });
  test("newest comments should be firs (date descending order)", () => {
    const reviewId = 2;
    return request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSorted("created_at", { descending: true });
      });
  });
  test("should return a status code of 200 and an empty array if ID exists but has no reviews", () => {
    const reviewId = 1;
    return request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test("should get 404 if given an ID which does not exist...yet", () => {
    const reviewId = 1002;
    return request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          `Try again - ID ${reviewId} does not exist yet!!!`
        );
      });
  });

  test("should get 400 error if given bad path/invalid syntax ", () => {
    const reviewId = "apple";
    return request(app)
      .get(`/api/reviews/${reviewId}/comments`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "bad request" });
      });
  });
});
describe("POST /api/reviews/:review_id/comments", () => {
  test("should create a new comment and respond with an object of posted comment and other info", () => {
    const review_id = 3;
    const requestBody = {
      username: "mallionaire",
      body: "Posted successfully!",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(201)
      .expect((response) => {
        const comment = response.body.comment;
        expect(comment.review_id).toBe(review_id);
        expect(comment.author).toBe(requestBody.username);
        expect(comment.body).toBe(requestBody.body);
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("votes");
        expect(comment).toHaveProperty("created_at");
      });
  });
  test("when give more than 2 properties - should respond with 201 and an object of posted comment and other info", () => {
    const review_id = 3;
    const requestBody = {
      username: "mallionaire",
      body: "Posted successfully!",
      new: "not-here",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(201)
      .expect((response) => {
        const comment = response.body.comment;
        expect(comment.review_id).toBe(review_id);
        expect(comment.author).toBe(requestBody.username);
        expect(comment.body).toBe(requestBody.body);
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("votes");
        expect(comment).toHaveProperty("created_at");
      });
  });

  test("should get 404 if given an ID which does not exist...yet", () => {
    const reviewId = 1002;
    const requestBody = {
      username: "mallionaire",
      body: "Posted successfully!",
      new: "not-here",
    };
    return request(app)
      .post(`/api/reviews/${reviewId}/comments`)
      .send(requestBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Try again - Not found!!!");
      });
  });

  test("should get 404 if given a username does not exist", () => {
    const reviewId = 3;
    const requestBody = {
      username: "not-here",
      body: "Posted successfully!",
    };
    return request(app)
      .post(`/api/reviews/${reviewId}/comments`)
      .send(requestBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("Try again - Not found!!!");
      });
  });

  test("should get 400 error if given bad path/invalid syntax", () => {
    const review_id = "pear";
    const requestBody = {
      username: "mallionaire",
      body: "Posted successfully!",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("bad request");
      });
  });
  test("should get 400 error if required field(s) are not filled in", () => {
    const review_id = 3;
    const requestBody = {
      username: "mallionaire",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("bad request");
      });
  });
});
describe("Task 10 - GET /api/reviews (queries)", () => {
  test("should responds with all reviews if no queries are provided", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        expect(body.reviews.length).toBe(13);
      });
  });
  test("responds with reviews filtered by category if category query is provided", () => {
    const category = "dexterity";
    return request(app)
      .get(`/api/reviews?category=${category}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.reviews.length).toBe(1);
        expect(body.reviews[0].category).toBe(category);
      });
  });
  test("responds with reviews sorted by specified column", () => {
    const column = "title";
    return request(app)
      .get(`/api/reviews?sort_by=${column}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.reviews.length).toBe(13);
        expect(body.reviews).toBeSorted(column, { descending: true });
      });
  });
  test("responds with reviews sorted in specified order", () => {
    const order = "asc";
    return request(app)
      .get(`/api/reviews?order=${order}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.reviews.length).toBe(13);
        expect(body.reviews).toBeSorted("created_at", { descending: true });
      });
  });
  test("should return a 404 error if category query is invalid", () => {
    const category = "not-here";
    return request(app)
      .get(`/api/reviews?category=${category}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          `Try again -  ${category} does not exist yet!!!`
        );
      });
  });
  test("should return a 400 error if order query is invalid", () => {
    const sort_by = "invalid";
    return request(app)
      .get(`/api/reviews?sort_by=${sort_by}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(`bad request`);
      });
  });
  test("should return a 400 error if order query is invalid", () => {
    const order = "invalid";
    return request(app)
      .get(`/api/reviews?order=${order}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(`bad request`);
      });
  });
  test.skip("responds with reviews filtered by category if category query is provided", () => {
    const category = "children's games";
    return request(app)
      .get(`/api/reviews?category=${category}`)
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        expect(body.reviews.length).toBe(1);
        expect(body.reviews[0].category).toBe(category);
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("deletes the comment by comment id and responds with status 204", () => {
    const comment_id = 3;
    return request(app)
      .delete(`/api/comments/${comment_id}`)
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("test -return an error if comment id does not exist", () => {
    const comment_id = 18;
    return request(app)
      .delete(`/api/comments/${comment_id}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          `Try again - ID ${comment_id} does not exist!!!`
        );
      });
  });
});
describe("Task 8 - PATCH /api/reviews/:review_id", () => {
  test("should respond by adding (+1) to the votes property and return with the updated review ", () => {
    const review_id = 3;
    const voteChange = 1;
    const requestBody = { inc_votes: voteChange };
    return request(app)
      .get(`/api/reviews/${review_id}`)
      .then((originalReview) => {
        const originalVoteCount = originalReview.body.review.votes;
        return request(app)
          .patch(`/api/reviews/${review_id}`)
          .send(requestBody)
          .expect(200)
          .then(({ body }) => {
            const expectedVoteCount = originalVoteCount + voteChange;
            expect(body.review.votes).toBe(expectedVoteCount);
          });
      });
  });
  test("should respond by decreasing (-1) the votes property and return with the updated review  ", () => {
    const review_id = 3;
    const voteChange = -1;
    const requestBody = { inc_votes: voteChange };
    return request(app)
      .get(`/api/reviews/${review_id}`)
      .then((originalReview) => {
        const originalVoteCount = originalReview.body.review.votes;
        return request(app)
          .patch(`/api/reviews/${review_id}`)
          .send(requestBody)
          .expect(200)
          .then(({ body }) => {
            const expectedVoteCount = originalVoteCount + voteChange;
            expect(body.review.votes).toBe(expectedVoteCount);
          });
      });
  });
  test("should get 404 if given an ID which does not exist...yet", () => {
    const review_id = 1002;
    const voteChange = 1;
    const requestBody = { inc_votes: voteChange };
    return request(app)
      .patch(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Try again - Path not found!!!");
      });
  });
  test("should get 400 error if ID id invalid/bad", () => {
    const review_id = "banana";
    const voteChange = 1;
    const requestBody = { inc_votes: voteChange };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("bad request");
      });
  });
  test("should get 400 error if required field(s) are not filled in", () => {
    const review_id = 3;
    const requestBody = {
      username: "mallionaire",
    };
    return request(app)
      .post(`/api/reviews/${review_id}/comments`)
      .send(requestBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("bad request");
      });
  });
});

describe("Task 9 - GET /api/users", () => {
  test("should return 200 status & an array of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(4);
        body.forEach((review) => {
          expect(review).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("Task 11 - GET /api/reviews/:review_id (comment_count)", () => {
  test("should return a review object with a property of comment count", () => {
    const review_id = 3;
    return request(app)
      .get(`/api/reviews/${review_id}`)
      .expect(200)
      .then((response) => {
        const commentCount = response.body.review;
        expect(commentCount).toHaveProperty("comment_count");
        expect(typeof commentCount.comment_count).toBe("number");
      });
  });

  test("should return a 404 error for review id which does not exist yet", () => {
    const review_id = 1902;
    return request(app)
      .get(`/api/reviews/${review_id}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          `Try again - ID ${review_id} does not exist yet!!!`
        );
      });
  });
});
