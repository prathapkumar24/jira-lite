import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
      const breakingTestVar:any =    "this should break"   ;
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
