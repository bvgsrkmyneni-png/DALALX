const pool = require("../config/db");

let marketInterval = null;


// ==================================================
// INDIAN MARKET STATUS
// ==================================================

const getMarketStatus = () => {
  const now = new Date();

  const indiaTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);

  const parts = {};

  indiaTime.forEach((part) => {
    parts[part.type] = part.value;
  });

  const weekday = parts.weekday;
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  // Saturday and Sunday
  if (
    weekday === "Sat" ||
    weekday === "Sun"
  ) {
    return {
      isOpen: false,
      status: "WEEKEND"
    };
  }

  const currentMinutes =
    hour * 60 + minute;

  // NSE/BSE normal market session
  const marketOpen =
    9 * 60 + 15; // 9:15 AM

  const marketClose =
    15 * 60 + 30; // 3:30 PM

  if (
    currentMinutes >= marketOpen &&
    currentMinutes < marketClose
  ) {
    return {
      isOpen: true,
      status: "OPEN"
    };
  }

  return {
    isOpen: false,
    status: "CLOSED"
  };
};


// ==================================================
// UPDATE VIRTUAL MARKET PRICES
// ==================================================

const updateMarketPrices = async () => {

  const market = getMarketStatus();

  /*
    IMPORTANT:

    DALALX is a virtual stock market.

    Therefore, prices continue moving even
    when the real Indian stock market is closed.

    This makes the project better for:
    - demonstration
    - testing
    - live charts
    - college project presentation
  */

  if (!market.isOpen) {
    console.log(
      `Indian market ${market.status} - DALALX virtual market continues`
    );
  }


  const client = await pool.connect();

  try {

    await client.query("BEGIN");


    // Get all stocks and lock their rows
    const result = await client.query(`
      SELECT
        stock_id,
        symbol,
        current_price,
        day_open_price
      FROM stocks
      ORDER BY stock_id
      FOR UPDATE
    `);


    for (const stock of result.rows) {

      const currentPrice =
        Number(stock.current_price);


      const dayOpenPrice =
        Number(
          stock.day_open_price ||
          stock.current_price
        );


      // ==================================================
      // SMALL RANDOM PRICE MOVEMENT
      // ==================================================

      const movement =
        (Math.random() - 0.5) * 0.007;


      let newPrice =
        currentPrice *
        (1 + movement);


      // ==================================================
      // KEEP PRICE WITHIN ±5% OF DAY OPEN
      // ==================================================

      const minimumPrice =
        dayOpenPrice * 0.95;

      const maximumPrice =
        dayOpenPrice * 1.05;


      newPrice = Math.max(
        minimumPrice,
        Math.min(
          maximumPrice,
          newPrice
        )
      );


      // Keep 2 decimal places
      newPrice =
        Number(
          newPrice.toFixed(2)
        );


      // ==================================================
      // CALCULATE CHANGE %
      // ==================================================

      const changePercent =
        (
          (newPrice - dayOpenPrice) /
          dayOpenPrice
        ) * 100;


      const roundedChange =
        Number(
          changePercent.toFixed(2)
        );


      // ==================================================
      // UPDATE DATABASE
      // ==================================================

      await client.query(
        `
        UPDATE stocks
        SET
          current_price = $1,
          change_percent = $2
        WHERE stock_id = $3
        `,
        [
          newPrice,
          roundedChange,
          stock.stock_id
        ]
      );

    }


    await client.query("COMMIT");


    console.log(
      `DALALX prices updated at ${new Date().toLocaleTimeString()}`
    );


  } catch (error) {

    await client.query("ROLLBACK");

    console.error(
      "Market update error:",
      error.message
    );


  } finally {

    client.release();

  }
};


// ==================================================
// START MARKET SIMULATION
// ==================================================

const startMarketSimulation = () => {

  // Prevent multiple intervals
  if (marketInterval) {
    return;
  }


  console.log(
    "DALALX real-time virtual market simulation started."
  );


  // Update immediately
  updateMarketPrices();


  // Update every 3 seconds
  marketInterval =
    setInterval(
      updateMarketPrices,
      3000
    );

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
  startMarketSimulation,
  updateMarketPrices,
  getMarketStatus
};