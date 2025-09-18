import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend connection (allow localhost and *.vercel.app)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        // Explicitly allow a configured frontend URL if provided
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[];

      const isLocalhost = origin.startsWith('http://localhost');
      const isVercel = /https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
      const isExplicitAllowed = allowedOrigins.includes(origin);

      if (isLocalhost || isVercel || isExplicitAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
