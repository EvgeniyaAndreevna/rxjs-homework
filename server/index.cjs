const app = require('./app.cjs');
const port = Number(process.env.PORT || 7071);
app.listen(port, '0.0.0.0', () => console.log(`RxJS API: http://localhost:${port}`));
