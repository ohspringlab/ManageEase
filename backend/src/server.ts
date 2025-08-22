import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 ManageEase API running on port ${PORT}`);
});