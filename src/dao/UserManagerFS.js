import fs from "fs";

export class UserManager {
  constructor() {
    this.path = "./src/data/users.json";
  }
  async getAll() {
    let userData = await fs.promises.readFile(this.path, {
      encoding: "utf-8",
    });
    let parsedData = JSON.parse(userData);
    return parsedData;
  }

  async saveData(data) {
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 5));
  }

  async createJsonUser(user) {
    let userList = [];
    userList.push({ ...user });
    await this.saveData(user);
  }

  async addJsonUser(user) {
    let userList = await this.getAll();
    let newUser = { ...user };
    // const userValidation = userList.some((user) => user.email == email);
    // if (userValidation) {
    //   return `Email ${email} is already registered`;
    // }
    userList.push(newUser);
    await this.saveData(userList);
  }

  async create(user) {
    if (fs.existsSync(this.path)) {
      await this.addJsonUser({ ...user });
    } else {
      await this.createJsonUser({ ...user });
    }
  }
  async getBy(filter) {
    let userList = await this.getAll();
    const search = userList.find((user) => {
      return Object.keys(filter).every((key) => user[key] === filter[key]);
    });
    if (search) {
      return search;
    } else {
      return "User not found";
    }
  }

  async delete(id) {
    let userList = await this.getAll();
    let findUser = userList.find((u) => u.id === id);
    let i = userList.indexOf(findUser);
    if (i !== -1) {
      userList.splice(i, 1);
    }
    if (!findUser) {
      return "user not found";
    }
    await this.saveData(userList);
  }
}
