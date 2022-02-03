const express = require('express');
const app = express();

app.get('/', (req,res) => {
    res.send("YelpCamp")
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})