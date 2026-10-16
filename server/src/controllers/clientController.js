const Client = require("../models/Client");

exports.createClient = async (req, res) => {
  try {
    const {
      clientName,
      companyName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
    } = req.body;

    // Validate required field
    if (!clientName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client name is required",
      });
    }

    // Create client with all supported fields
    const client = await Client.create({
      clientName: clientName.trim(),
      companyName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
    });

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("Create client error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create client",
    });
  }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("Get clients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch clients",
    });
  }
};