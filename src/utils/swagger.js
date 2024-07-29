import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Backend",
      version: "1.0.0",
      description: "Ecommerce API documentation",
    },
  },
  apis: ["./src/docs/*.yaml"],
};

export const specs = swaggerJsDoc(options);
