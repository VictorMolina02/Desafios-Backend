import fs from "fs";

export class TicketManager {
  async create(amount, purchaser, products) {
    let code = Math.floor(Math.random() * 9000000) + 1000000;
    let purchase_datetime = new Date();
    return await ticketsModel.create({
      code,
      purchase_datetime,
      amount,
      purchaser,
      products,
    });
  }
}
