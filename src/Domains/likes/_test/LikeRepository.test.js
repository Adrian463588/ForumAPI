import { describe, it, expect } from 'vitest';
import LikeRepository from '../LikeRepository.js';

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action & Assert
    await expect(likeRepository.checkLikeExists('', ''))
      .rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.addLike('', ''))
      .rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.removeLike('', ''))
      .rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.getLikeCountsByCommentIds([]))
      .rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
