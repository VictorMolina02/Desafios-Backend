import { usersModel } from "../dao/models/userModel.js";
import { CustomError } from "../utils/CustomError.js";
import { ERROR_TYPES } from "../utils/EErrors.js";

export class UserController {
  static roleChange = async (req, res, next) => {
    try {
      let { uid } = req.params;
      try {
        const user = await usersModel.findOne({ _id: uid });
        if (user.role.toLowerCase() == "user") {
          user.role = "premium";
          await user.save();
          return res
            .status(200)
            .json({ payload: `User ${user.email} is now ${user.role}` });
        }
        if (user.role.toLowerCase() == "premium") {
          user.role = "user";
          await user.save();
          return res
            .status(200)
            .json({ payload: `User ${user.email} is now ${user.role}` });
        }
        if (user.role.toLowerCase() == "admin") {
          return CustomError.createError(
            "ERROR",
            null,
            "Cannot change administrator role",
            ERROR_TYPES.DATA_TYPE
          );
        }
      } catch (error) {
        return CustomError.createError(
          "Not found",
          null,
          "User not found",
          ERROR_TYPES.NOT_FOUND
        );
      }
    } catch (error) {
      next(error);
    }
  };
}
