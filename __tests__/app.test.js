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
  test("should an array of comments for the given review_id of which each comment should have the given properties", () => {
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
});
