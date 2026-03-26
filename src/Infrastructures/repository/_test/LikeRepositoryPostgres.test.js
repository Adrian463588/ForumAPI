import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-456' });
  });

  afterAll(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  describe('checkLikeExists', () => {
    it('should return true when like exists', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const exists = await likeRepository.checkLikeExists('user-123', 'comment-123');

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false when like does not exist', async () => {
      // Arrange
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const exists = await likeRepository.checkLikeExists('user-123', 'comment-123');

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('addLike', () => {
    it('should persist like', async () => {
      // Arrange
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      await likeRepository.addLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikesByUserAndComment('user-123', 'comment-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('removeLike', () => {
    it('should remove like', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      await likeRepository.removeLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikesByUserAndComment('user-123', 'comment-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountsByCommentIds', () => {
    it('should return like counts for given comment ids', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-456', userId: 'user-456', commentId: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-789', userId: 'user-123', commentId: 'comment-456' });
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const likeCounts = await likeRepository.getLikeCountsByCommentIds(['comment-123', 'comment-456']);

      // Assert
      expect(likeCounts).toHaveLength(2);

      const comment123Count = likeCounts.find((lc) => lc.comment_id === 'comment-123');
      const comment456Count = likeCounts.find((lc) => lc.comment_id === 'comment-456');

      expect(parseInt(comment123Count.like_count, 10)).toEqual(2);
      expect(parseInt(comment456Count.like_count, 10)).toEqual(1);
    });

    it('should return empty array when no likes exist', async () => {
      // Arrange
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const likeCounts = await likeRepository.getLikeCountsByCommentIds(['comment-123']);

      // Assert
      expect(likeCounts).toHaveLength(0);
    });
  });
});
