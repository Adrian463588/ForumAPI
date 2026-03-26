import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads/:threadId/comments/:commentId/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and persisted reply', async () => {
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
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.id).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('sebuah balasan');
      expect(response.body.data.addedReply.owner).toBeDefined();
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

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah comment' });
      const { id: commentId } = commentResponse.body.data.addedComment;

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
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
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 when deleting own reply', async () => {
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

      // create reply
      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });
      const { id: replyId } = replyResponse.body.data.addedReply;

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 403 when deleting reply by non-owner', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // create thread and comment and reply as first user
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

      const replyResponse = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });
      const { id: replyId } = replyResponse.body.data.addedReply;

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

      // Action — delete reply as second user
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
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
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
