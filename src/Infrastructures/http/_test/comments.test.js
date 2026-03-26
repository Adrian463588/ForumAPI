import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads/:threadId/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/:threadId/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // create thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.id).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah comment');
      expect(response.body.data.addedComment.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'sebuah comment' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId', () => {
    it('should response 200 when deleting own comment', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // create thread
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      // create comment
      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when deleting comment by non-owner', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // create thread and comment as first user
      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadResponse.body.data.addedThread;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // register and login as second user
      await request(app).post('/users').send({
        username: 'johndoe',
        password: 'secret',
        fullname: 'John Doe',
      });
      const otherLoginResponse = await request(app).post('/authentications').send({
        username: 'johndoe',
        password: 'secret',
      });
      const otherAccessToken = otherLoginResponse.body.data.accessToken;

      // Action — delete comment as second user
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
