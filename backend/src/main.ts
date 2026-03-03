import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Habilitar CORS para desarrollo con Angular y Electron
    app.enableCors({
      origin: ['http://localhost:4200', 'http://localhost:3000', 'file://*'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    // Validación global de DTOs
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`🚀 🛠️Emi Repuestos⚙️ Backend API corriendo en: http://localhost:${port}`);
    console.log(`📊 Base de datos conectada correctamente`);
    console.log(`✅ Sistema listo para usar`);
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('MongooseServerSelectionError')) {
      console.error('\n⚠️  MongoDB no está disponible.');
      console.error('💡 Soluciones:');
      console.error('   1. Instalar MongoDB: https://www.mongodb.com/try/download/community');
      console.error('   2. Iniciar el servicio: Start-Service MongoDB');
      console.error('   3. O usar la versión con SQLite (más simple para desktop)');
    }
    
    process.exit(1);
  }
}

bootstrap();
