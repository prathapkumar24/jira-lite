// test/setup-env.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force Jest to look at the test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
