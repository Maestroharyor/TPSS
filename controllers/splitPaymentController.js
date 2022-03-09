const { validationResult } = require("express-validator");
const sortArray = require("sort-array");

module.exports.split_payment = async (req, res) => {
  // Error Checking
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  } else {
    //   Request body desctructuring
    const { ID, Amount, Currency, CustomerEmail, SplitInfo } = req.body;

    // Get Ratio Total Function
    const getRatioTotal = (splitArray) => {
      let total = splitArray
        .filter((ar) => ar["SplitType"] === "RATIO")
        .reduce((a, b) => a["SplitValue"] + b["SplitValue"]);
      return total;
    };

    // Get First Ratio Index Function
    const search = (el) => el.SplitType == "RATIO";

    // Check If Amount is Lesser than 0
    const checkAmount = (title, amount) => {
      if (amount < 0) {
        res
          .status(400)
          .json({ message: `${title} (${amount}) is lesser than 0` });
        res.end();
      }
    };

    // Check Split Amount Errors
    const splitAmountErrorCheck = (title, amount) => {
      checkAmount(title, amount);
      if (amount > Amount) {
        res
          .status(400)
          .json({
            message: `${title} (${amount}) is greater than transactional amount (${Amount})`
          });
        res.end();
      }
    };

    // Essential Variables
    const SplitBreakdown = [];
    let balance = Amount;
    let totalRatioBalance;
    let totalRatio;

    //Main loop for Split Info
    try {
      let sortedArray = sortArray(SplitInfo, {
        by: "SplitType"
      });

      let firstRatioIndex = sortedArray.findIndex(search);

      sortedArray.map((info, index) => {
        let infoData = {};
        infoData.SplitEntityId = info.SplitEntityId;
        if (info.SplitType === "FLAT") {
          infoData.Amount = info.SplitValue;
          balance = balance - info.SplitValue;

          //   Check Error
          splitAmountErrorCheck("Split Amount", infoData.Amount);
        } else if (info.SplitType === "PERCENTAGE") {
          let percentage = (info.SplitValue / 100) * balance;
          infoData.Amount = percentage;
          balance = balance - percentage;

          //   Check Error
          splitAmountErrorCheck("Split Amount", infoData.Amount);
        } else {
          if (index === firstRatioIndex) {
            totalRatio = getRatioTotal(SplitInfo);
            totalRatioBalance = balance;
          }
          let splitAmount = (info.SplitValue / totalRatio) * totalRatioBalance;
          infoData.Amount = splitAmount;
          balance = balance - splitAmount;

          //   Check Error
          splitAmountErrorCheck("Split Amount", infoData.Amount);
        }
        SplitBreakdown.push(infoData);
      });

      //Balance Error Check
      checkAmount("Final Balance", balance);

    //   Split Amount Total Error Check
    let splitAmountTotal = SplitBreakdown.reduce((a, b) => a["SplitValue"] + b["SplitValue"]);

    if(splitAmountTotal > Amount){
        res
          .status(400)
          .json({ message: `The sum of all split Amount values computed (${splitAmountTotal}) is greater than the Transaction Amount (${Amount})` });
        res.end();
    }

      // Create and send response
      const response = { ID, balance, SplitBreakdown };

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  }
};
