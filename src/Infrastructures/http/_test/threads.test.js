import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = { title: 'sebuah thread', body: 'sebuah body thread' };
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
      expect(response.body.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = { title: 'sebuah thread' };
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const requestPayload = { title: 'sebuah thread', body: 'sebuah body thread' };
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when GET /threads/:threadId', () => {
    it('should response 200 and return thread detail', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // create thread first
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(threadId);
      expect(response.body.data.thread.title).toEqual('sebuah thread');
      expect(response.body.data.thread.body).toEqual('sebuah body thread');
      expect(response.body.data.thread.username).toBeDefined();
      expect(response.body.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-xxx');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
