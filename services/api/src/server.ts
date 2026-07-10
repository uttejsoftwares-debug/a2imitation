import dotenv from 'dotenv';
import app from './index.js';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`a2-api listening on http://localhost:${PORT}`);
});

export {};
