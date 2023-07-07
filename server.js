const express = require("express");
const db = require("./models");
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const { Writable, Readable } = require("stream");

const app = express();

app.get("/", async function (req, res) {
  // init document
  let doc = new PDFDocument({ margin: 30, size: "A4" });
  // save document
  doc.pipe(fs.createWriteStream("./document.pdf"));

  async function createTable(data) {
    
    const table = {
      title: "Title",
      subtitle: "Subtitle",
      headers: [
        { label: "Sno", property: "id", width: 60, renderer: null },
        { label: "Username", property: "username", width: 150, renderer: null },
        { label: "Email", property: "email", width: 100, renderer: null },
      ],
    
      datas:data

    
    };
    
    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, "blue", 0.15);
      },
    });
   
    doc.end();
  }

  var page = 0;
  var perPage = 1000;
  var loadedData = [];
  var totalRecords = await db.User.count();
  // var totalRecords = 10;
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

  datachuck.addListener("data", (data) => {
    loadedData= [...loadedData,...JSON.parse(data)];
  });

  datachuck.addListener("end", () => {
    createTable(loadedData);
    console.log("total records",totalRecords)
  });

  res.send("okokok");
});

app.listen(3001, () => {
  console.log("Server started");
});
