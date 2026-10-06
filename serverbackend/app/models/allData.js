const connection = require("../../db");

// Define the JewelDetail model

const JewelDetail = {

  // Other model methods...

  // Function to get all jewel details

  getAllJewelDetail: (callback) => {

    connection.query('SELECT * FROM jeweldetail', (error, results) => {

      if (error) {

        callback(error, null);

        return;

      }

      callback(null, results);

    });

  },

};

// Export the JewelDetail model

module.exports = JewelDetail;

