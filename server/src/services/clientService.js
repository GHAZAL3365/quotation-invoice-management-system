const Client = require("../models/Client");


const Client = require("../models/Client");

const createClient = async (clientData) => {
  const {
    clientName,
    email,
    phone,
    billingAddress,
    taxId,
    notes,
  } = clientData;

  const client = await Client.create({
    clientName,
    email,
    phone,
    billingAddress,
    taxId,
    notes,
  });

  return client;
};

module.exports = {
  createClient,
};

module.exports = {
  createClient,
};