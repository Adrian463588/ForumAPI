import { describe, it, expect, vi } from 'vitest';
import ToggleCommentLikeUseCase from '../ToggleCommentLikeUseCase.js';

describe('ToggleCommentLikeUseCase', () => {
  it('should orchestrate the like action correctly when not yet liked', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockLikeRepository = {
      checkLikeExists: vi.fn().mockResolvedValue(false),
      addLike: vi.fn().mockResolvedValue(),
      removeLike: vi.fn().mockResolvedValue(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await useCase.execute(threadId, commentId, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.checkLikeExists).toHaveBeenCalledWith(userId, commentId);
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(userId, commentId);
    expect(mockLikeRepository.removeLike).not.toHaveBeenCalled();
  });

  it('should orchestrate the unlike action correctly when already liked', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockLikeRepository = {
      checkLikeExists: vi.fn().mockResolvedValue(true),
      addLike: vi.fn().mockResolvedValue(),
      removeLike: vi.fn().mockResolvedValue(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await useCase.execute(threadId, commentId, userId);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockLikeRepository.checkLikeExists).toHaveBeenCalledWith(userId, commentId);
    expect(mockLikeRepository.removeLike).toHaveBeenCalledWith(userId, commentId);
    expect(mockLikeRepository.addLike).not.toHaveBeenCalled();
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(),
    };
    const mockLikeRepository = {
      checkLikeExists: vi.fn(),
      addLike: vi.fn(),
      removeLike: vi.fn(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(useCase.execute('thread-xxx', 'comment-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(mockLikeRepository.checkLikeExists).not.toHaveBeenCalled();
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockRejectedValue(new Error('komentar tidak ditemukan')),
    };
    const mockLikeRepository = {
      checkLikeExists: vi.fn(),
      addLike: vi.fn(),
      removeLike: vi.fn(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(useCase.execute('thread-123', 'comment-xxx', 'user-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
    expect(mockLikeRepository.checkLikeExists).not.toHaveBeenCalled();
  });
});
