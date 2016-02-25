'use strict';


const express = require('express');
const sqlite3 = require('sqlite3');


const PORT = process.env.PORT || 3000;

const app = express();
const db = new sqlite3.Database('./db/chinook.sqlite');

// How dates are formatted in SQL is the 'date iso' format...need this to get date data back

// How many Invoices were there in 2009 and 2011? What are the respective total sales for each of those years?
//req.query = { filter: { year: '2009,2011' } }

// in browser put this --http://localhost:3000/sales-per-year?filter[year]=2009,2011

/// sqlite is used a lot for mobile apps because only the database is needed.
app.get('/sales-per-year', (req, res) => {

const filterYears = req.query.filter.year.split(',').map(y => +y);

let having ='HAVING';

if (req.query.filter) {
    having = 'HAVING';

    req.query.filter.year
      .split(',')
      .map(y => +y)
      .forEach(y => {
        having += ` year = "${y}" OR`;
      });

    having = having.substring(0, having.length - 3);
  }

  db.all(`
    SELECT count(*) as invoices,
           sum(Total) as total,
           strftime('%Y', InvoiceDate) as year
    FROM   Invoice
    GROUP BY year
    HAVING year = "2009"
        OR year = "2011"`,
      (err, data) => {
        if (err) throw err;

        const roundedData = data.map(function (obj) {
          return {
            invoices: obj.invoices,
            year: +obj.year,
            total: +obj.total.toFixed(2)
          }
        });

        res.send({
          data: roundedData,
          info: '# of invoices and sales per year'
        });
      }
    );
});


//// getting JSON data in browser pertaining to country
app.get('/invoices-per-country', (req, res) => {
  db.all(`
    SELECT   COUNT(*) AS count,
             BillingCountry AS country
    FROM     Invoice
    GROUP BY BillingCountry
    ORDER BY count DESC`,
      (err, data) => {
        if (err) throw err;

        res.send({
          data: data,
          info: '# of invoices per country'
        });
      }
   );
});


/// tells what port to listen on for getting data to browser
app.listen(PORT, () => {
  console.log(`Express server listening on port: ${PORT}`);
});
