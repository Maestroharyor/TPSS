const { body } = require("express-validator");

module.exports.validate = [
  body("ID", "ID not passed or invalid").exists().isNumeric(),
  body("Amount", "Number not sent or invalid").exists().isNumeric(),
  body("Currency", "Currency not sent or invalid").exists().isAlpha(),
  body("CustomerEmail", "Email not sent or invalid").exists().isEmail(),
  body("SplitInfo", "SplitInfo not sent or invalid")
    .exists()
    .isArray({ min: 1, max: 20 })
];
// module.exports.validate = (method) => {
//     switch (method) {
//       case 'transaction': {
//        return [
//           body('ID', "ID not passed or invalid").exists().isNumeric(),
//           body('Amount', 'Number not sent or invalid').exists().isNumeric(),
//           body('Currency', 'Currency not sent or invalid').exists().isAlpha(),
//           body('CustomerEmail', 'Email not sent or invalid').exists().isEmail(),
//           body('SplitInfo', 'SplitInfo not sent or invalid').exists().isArray({ min: 1, max: 2 }),
//          ]
//       }
//     }
//   }
