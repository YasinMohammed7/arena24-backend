import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../prisma/prisma.service';

let prisma: PrismaService;
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('(POST) /auth/register', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'test',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'test@example.com');
        expect(res.body).toHaveProperty('id');
        // Add more checks for user if needed
      });
  });

  it('(POST) /auth/login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'test',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('refresh_token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
      });
  });

  afterAll(async () => {
    // Clean up test user from database
    try {
      prisma = new PrismaService();
      await prisma.$connect();

      await prisma.user.delete({
        where: {
          email: 'test@example.com',
        },
      });
    } catch (error) {
      console.log('Test cleanup: User may not exist to delete');
    }

    await app.close();
  });
});
