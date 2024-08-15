import { usersModel } from "../dao/models/userModel.js";
import { CustomError } from "../utils/CustomError.js";
import { ERROR_TYPES } from "../utils/EErrors.js";

export class UserController {
  static roleChange = async (req, res, next) => {
    try {
      let { uid } = req.params;
      try {
        const user = await usersModel.findOne({ _id: uid });
        const requiredDocs = ["identification", "address", "statement"];
        const userDocs = user.documents.map((doc) => doc.name.split("-")[0]);
        const hasAllDocs = requiredDocs.every((doc) => userDocs.includes(doc));
        if (!user) {
          return next(
            CustomError.createError(
              "Not found",
              null,
              "User not found",
              ERROR_TYPES.NOT_FOUND
            )
          );
        }
        if (!hasAllDocs) {
          return res.status(400).json({
            error: "Missing required documents to upgrade to premium",
          });
        }

        if (user.role.toLowerCase() === "user") {
          user.role = "premium";
        } else if (user.role.toLowerCase() === "premium") {
          user.role = "user";
        } else if (user.role.toLowerCase() === "admin") {
          return CustomError.createError(
            "ERROR",
            null,
            "Cannot change administrator role",
            ERROR_TYPES.DATA_TYPE
          );
        }

        await user.save();
        return res
          .status(200)
          .json({ payload: `User ${user.email} is now ${user.role}` });
      } catch (error) {
        return CustomError.createError(
          "Not found",
          null,
          `User not found, ${error.message}`,
          ERROR_TYPES.NOT_FOUND
        );
      }
    } catch (error) {
      next(error);
    }
  };

  static uploadDocuments = async (req, res, next) => {
    let { uid } = req.params;
    try {
      if (!req.files) {
        return CustomError.createError(
          "Error",
          null,
          "No files were uploaded",
          ERROR_TYPES.DATA_TYPE
        );
      }
      const documents = [];
      const files = req.files;
      if (files.product) {
        files.product.forEach((file) => {
          documents.push({
            name: file.filename,
            reference: file.path,
          });
        });
      }

      if (files.profile) {
        files.profile.forEach((file) => {
          documents.push({
            name: file.filename,
            reference: file.path,
          });
        });
      }

      if (files.document) {
        files.document.forEach((file) => {
          documents.push({
            name: file.filename,
            reference: file.path,
          });
        });
      }
      let user = await usersModel.findOne({ _id: uid });
      if (!user) {
        return next(
          CustomError.createError(
            "Not found",
            null,
            "User not found",
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      user.documents.push(...documents);
      await user.save();
      res.status(200).json({
        message: "Documents uploaded successfully",
        documents: user.documents,
      });
    } catch (error) {
      if (error.code !== 500) {
        req.logger.error(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error.code,
            },
            null,
            5
          )
        );
      } else {
        req.logger.fatal(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              stack: error.stack,
              code: error.code,
            },
            null,
            5
          )
        );
      }
      next(error);
    }
  };
}
