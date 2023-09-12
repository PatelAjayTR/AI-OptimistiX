const env = require('dotenv')
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const adminRoute = require('./routes/admin');
const cors = require('cors');

env.config();
const app = express();
const port = 3000;

app.use(cors())
app.use(bodyParser.json())
app.use('/api', adminRoute);
app.listen(port, () => {
    // embedTextEmbedding('');
    console.log(`Server running on port ${port}`);
    // ReadDocumentContentToSupbaseDBTable();
});


