import fs from "fs";
import { faker, fakerES } from "@faker-js/faker";

export class ProductManager {
  constructor() {
    this.path = "./src/data/products.json";
  }
  async getAll() {
    let productData = await fs.promises.readFile(this.path, {
      encoding: "utf-8",
    });
    let parsedData = JSON.parse(productData);
    return parsedData;
  }

  async saveData(data) {
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 5));
  }

  async createJsonProduct(
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  ) {
    let cart = [];
    cart.push({
      _id: faker.database.mongodbObjectId(),
      title: title,
      description: description,
      code: code,
      price: "$" + price,
      status: status,
      stock: stock,
      category: category,
      thumbnails: thumbnails,
    });
    await this.saveData(cart);
  }

  async addJsonProduct(
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  ) {
    let productList = await this.getAll();
    let productAdded = {
      _id: faker.database.mongodbObjectId(),
      title: title,
      description: description,
      code: code,
      price: "$" + price,
      status: status,
      stock: stock,
      category: category,
      thumbnails: thumbnails,
    };
    const codeValidation = productList.some((product) => product.code == code);
    productList.push(productAdded);
    if (codeValidation) {
      return `Code ${code} is already registered`;
    }
    await this.saveData(productList);
  }

  async create({
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails = [], // tambien pasar en el body de la request como array
    owner,
  }) {
    if (fs.existsSync(this.path)) {
      await this.addJsonProduct(
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
        owner
      );
    } else {
      await this.createJsonProduct(
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
        owner
      );
    }
  }

  async getPaginate(limit = 20, page = 1, price, query) {
    try {
      // Leer el archivo de datos (por ejemplo, "products.json")
      let products = await this.getAll();

      // Filtrar los productos según el query
      if (query) {
        products = products.filter((product) => {
          // Suponiendo que el query es un objeto simple con propiedades a filtrar
          return Object.keys(query).every((key) => product[key] === query[key]);
        });
      }

      // Ordenar los productos por precio si se especifica
      if (price) {
        if (price === "asc") {
          products.sort((a, b) => a.price - b.price);
        } else if (price === "desc") {
          products.sort((a, b) => b.price - a.price);
        }
      }

      // Asegurarse de que 'limit' sea un número válido y mayor que cero
      limit = Number(limit);
      if (isNaN(limit) || limit <= 0) {
        limit = 1; // Valor predeterminado si 'limit' es inválido
      }

      // Calcular la paginación
      const totalItems = products.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Obtener los elementos correspondientes a la página
      const payload = products.slice(startIndex, endIndex);

      // Información de paginación
      const paginationInfo = {
        status: "success",
        payload,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/products/?page=${page - 1}` : null,
        nextLink: page < totalPages ? `/products/?page=${page + 1}` : null,
      };
      return paginationInfo;
    } catch (error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  async getBy(filter) {
    let productList = await this.getAll();
    const search = productList.find((product) => {
      return Object.keys(filter).every((key) => product[key] === filter[key]);
    });

    if (search) {
      return search;
    } else {
      return "Product not found";
    }
  }

  async updateProducts(id, productData) {
    // ---> 'PRODUCTDATA' se pasa por el body de postman<---
    let productList = await this.getAll();
    let findProduct = productList.find((p) => p.id === id);
    let i = productList.indexOf(findProduct);
    if (!findProduct) {
      return "Product not found";
    }
    if (i !== -1) {
      const { id, ...rest } = productData;
      productList[i] = { ...productList[i], ...rest };
    }
    await this.saveData(productList);
  }

  async deleteProducts(productId) {
    let productList = await this.getAll();
    let findProduct = productList.find((p) => p.id === productId);
    let i = productList.indexOf(findProduct);
    if (i !== -1) {
      productList.splice(i, 1);
    }
    if (!findProduct) {
      return "Product not found";
    }
    let newId = 1;
    productList.forEach((p) => {
      p.id = newId++;
    });
    await this.saveData(productList);
  }
}
