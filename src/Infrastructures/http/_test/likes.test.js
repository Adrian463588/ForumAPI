import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';

describe('/threads/:threadId/comments/:commentId/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/:threadId/comments/:commentId/likes', () => {
    it('should response 200 and like the comment', async () => {
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

      // Action — like the comment
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 200 and unlike the comment when already liked', async () => {
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

      // like the comment first
      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Action — unlike the comment (toggle)
      const response = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should response 200 and return likeCount in thread detail', async () => {
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

      // like the comment
      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Action — get thread detail
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data.thread.comments[0].likeCount).toEqual(1);
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 404 when thread does not exist', async () => {
      // Arrange
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      // Action
      const response = await request(app)
        .put('/threads/thread-xxx/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should response 404 when comment does not exist', async () => {
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
        .put(`/threads/${threadId}/comments/comment-xxx/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
