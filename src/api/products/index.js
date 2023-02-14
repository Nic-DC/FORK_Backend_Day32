import express from "express";
import ProductsModel from "./model.js";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.id, { _id: 1, name: 1, description: 1, price: 1 });
    if (!product) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.status(200).send(product);
    }
  } catch (error) {
    console.log(`GET /:id - ERROR: `, error);
    next(error);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.status(204).send(); // no Content
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.status(200).send({ updatedProduct });
    }
  } catch (error) {
    console.log("PUT /:id - ERROR ", error);
    next(error);
  }
});

export default productsRouter;
