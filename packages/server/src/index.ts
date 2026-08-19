import { env } from './config/env';
import { createApp } from './app';

const mainApp = createApp();

mainApp.listen(env.PORT, () => {
	console.log(`StormChat Server is up and running on: ${env.PORT}`);
});
