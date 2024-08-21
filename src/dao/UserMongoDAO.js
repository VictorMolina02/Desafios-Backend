import { usersModel } from "./models/userModel.js";

export class UserManagerMongoDAO {
  async create(user) {
    return await usersModel.create(user);
  }

  async getBy(filter) {
    return await usersModel.findOne(filter).lean();
  }

  async getAll() {
    return await usersModel.find();
  }

  async delete(id) {
    return await usersModel.findByIdAndDelete(id);
  }
}
