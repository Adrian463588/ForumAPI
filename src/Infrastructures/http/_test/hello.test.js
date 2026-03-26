import request from 'supertest';
import createServer from '../../createServer.js';
import container from '../../../container.js';
import pool from '../../../database/postgres/pool.js';

describe('GET /hello endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when GET /hello is requested', () => {
    it('should return 200 and hello world message (Intentionally Failing Test)', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/hello');

      // Assert
      expect(response.status).toEqual(200);
      // Intentional failure: expecting 'fail' when it returns 'success'
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Hello World!');
    });
  });
});
