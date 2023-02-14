// By default jest does not work with the new import syntax
// We should add NODE_OPTIONS=--experimental-vm-modules to the test script in package.json to enable the usage of import syntax
// On Windows you cannot use NODE_OPTIONS (and all env vars) from command line --> YOU HAVE TO USE CROSS-ENV PACKAGE TO BE ABLE TO PASS
// ENV VARS TO COMMAND LINE SCRIPTS ON ALL OPERATIVE SYSTEMS!!!

import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "../src/server.js";
import ProductsModel from "../src/api/products/model.js";

dotenv.config();
// This command forces .env vars to be loaded into process.env.
// This is the way to do it whenever you can't use -r dotenv/config

const client = supertest(server);
// supertest is capable of executing server.listen of our Express app if we pass the Express server to it
// It will give us back a client that can be used to run http requests on that server

/* describe("Test APIs", () => {
  it("Should test that GET /test endpoint returns 200 and a body containing a message", async () => {
    const response = await client.get("/test")
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual("Test successfull")
  })
})
 */

const validProduct = {
  name: "A valid product",
  description: "balllablalblabl",
  price: 100,
};

const notValidProduct = {
  name: "A not valid product",
  price: 100,
};

const product = new ProductsModel({
  name: "Product 1",
  description: "This is a valid product",
  price: 10,
});
await product.save();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL_TEST);
  const product = new ProductsModel({ name: "test", description: "blalblabla", price: 20 });
  await product.save();
});
// beforeAll is a Jest hook ran before all the tests, usually it is used to connect to the db and to do some initial setup
// (like inserting some mock data in the db)

afterAll(async () => {
  await ProductsModel.deleteMany();
  await mongoose.connection.close();
});
// afterAll hook could be used to clean up the situation (close the connection to Mongo gently and clean up db/collections)

// describe("Test APIs", () => {
//   it("Should test that the env vars are set correctly", () => {
//     expect(process.env.MONGO_URL_TEST).toBeDefined();
//   });

//   it("Should test that POST /products returns a valid _id and 201", async () => {
//     const response = await client.post("/products").send(validProduct).expect(201);
//     expect(response.body._id).toBeDefined();
//   });

//   it("Should test that GET /products returns a success status and a body", async () => {
//     const response = await client.get("/products").expect(200);
//     console.log(response.body);
//   });

//   it("Should test that POST /products with a not valid product returns a 400", async () => {
//     await client.post("/products").send(notValidProduct).expect(400);
//   });
// });

describe(`M5-Day32-Homework ---> API testing: `, () => {
  it(`Should test that fetching on /products returns a success status code and a body`, async () => {
    const response = await client.get("/products");
    console.log("response.body: ", response.body);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array));
    const product = response.body[0];
    expect(product).toHaveProperty("_id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("description");
    expect(product).toHaveProperty("price");
  });
  it(`Should return a valid _id and 201 in case of a valid product, 400 if not`, async () => {
    const validResponse = await client.post("/products").send(validProduct);
    expect(validResponse.status).toBe(201);
    // it expects a string as an _id
    expect(validResponse.body).toHaveProperty("_id", expect.any(String));
    const notValidResponse = await client.post("/products").send(notValidProduct);
    expect(notValidResponse.status).toBe(400);
  });
  it(`For the /products/:id endpoint:`, async () => {
    const responseInvalid = await client.get("/products/123456123456123456123456");
    expect(responseInvalid.status).toBe(404);
    // Test with a valid ID
    const responseValid = await client.get(`/products/${product._id}`);
    expect(responseValid.status).toBe(200);
    expect(responseValid.body).toHaveProperty("_id", product._id.toString());
    expect(responseValid.body).toHaveProperty("name", product.name);
    expect(responseValid.body).toHaveProperty("description", product.description);
    expect(responseValid.body).toHaveProperty("price", product.price);
  }, 30000);

  it("should delete a product by ID", async () => {
    // Create a new product and save it to the database
    const newProduct = new ProductsModel({
      name: "Test Product",
      description: "A test product",
      price: 10.99,
    });
    const savedProduct = await newProduct.save();

    const response = await client.delete(`/products/${savedProduct._id}`).expect(204);

    // make sure the product was deleted from the database
    const deletedProduct = await ProductsModel.findById(savedProduct._id);
    expect(deletedProduct).toBeNull();
  });

  it("should return 404 for non-existing product ID", async () => {
    const response = await client.delete(`/products/123456789012345678901234`).expect(404);
    expect(response.body.message).toBe("Product not found");
  });

  it("Should test that a product is updated with a PUT request", async () => {
    const newProduct = { name: "New Product", description: "A new product", price: 10 };
    const product = await ProductsModel.create(newProduct);

    const updatedProduct = { name: "Updated Product", description: "An updated product", price: 20 };
    const response = await client.put(`/products/${product._id}`).send(updatedProduct);

    expect(response.status).toBe(200);
    expect(typeof response.body.name).toBe("string");
    expect(response.body.name).toBe("Updated Product");

    const updated = await ProductsModel.findById(product._id);
    expect(updated.name).toBe("Updated Product");
  });

  it("Should test that 404 is returned with a non-existing id", async () => {
    const newProduct = { name: "New Product", description: "A new product", price: 10 };
    const product = await ProductsModel.create(newProduct);

    const updatedProduct = { name: "Updated Product", description: "An updated product", price: 20 };
    const response = await client.put(`/products/${product._id}1`).send(updatedProduct);

    expect(response.status).toBe(404);
  });
});
