const express = require('express');
const app = express();
const port = 3001;
app.get('/health', (req, res) => { res.status(200).send({ status: 'OK' }) });
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});