const express = require("express");
const db = require("./models");
const { Writable, Readable } = require("stream");

const app = express();

app.get("/", async function (req, res) {
  var page = 0;
  var perPage = 1000;
  var totalRecords = await db.User.count();
  var totalPages = Math.round(totalRecords / perPage);
  console.log("🚀 ~ file: server.js:18 ~ totalPages:", totalPages);

  let datachuck = new Readable({
    async read(size) {
      if (page > totalPages) {
        this.push(null);
      }
      const result = await db.sequelize.query(
        `select * from Users ` + ` LIMIT ${perPage} OFFSET ${page * perPage}`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      this.push(JSON.stringify(result));
      page++;
    },
  });

  datachuck.pipe(res);
});

app.listen(3001, () => {
  console.log("Server started");
});
