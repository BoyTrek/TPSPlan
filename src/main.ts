import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateInputPipe } from './core/pipes/validate.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // global prefix
  app.setGlobalPrefix('/api/v1');
  // handle validasi input global
  app.useGlobalPipes(new ValidateInputPipe());

  // allow cors
  app.enableCors();

  // Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('API TPS PLAN')
    .setDescription('API Documentation')
    .setVersion('3.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();