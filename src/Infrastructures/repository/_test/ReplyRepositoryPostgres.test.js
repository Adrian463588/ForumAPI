import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      const newReply = { content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' };
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }));
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return replies for given comment IDs correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', content: 'sebuah balasan', owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].content).toEqual('sebuah balasan');
      expect(replies[0].date).toBeDefined();
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].comment_id).toEqual('comment-123');
    });

    it('should return empty array when given empty comment IDs', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([]);

      // Assert
      expect(replies).toEqual([]);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('verifyReplyExists function', () => {
    it('should not throw error when reply exists', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123'))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists('reply-xxx'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should not throw error when owner is correct', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-xxx', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when not the owner', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', owner: 'user-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });
  });
});
