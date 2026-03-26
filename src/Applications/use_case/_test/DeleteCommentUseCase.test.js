import { describe, it, expect, vi } from 'vitest';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
      verifyCommentOwner: vi.fn().mockResolvedValue(),
      deleteComment: vi.fn().mockResolvedValue(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(threadId, commentId, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(commentId, owner);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(commentId);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(),
      verifyCommentOwner: vi.fn(),
      deleteComment: vi.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('thread-xxx', 'comment-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockRejectedValue(new Error('komentar tidak ditemukan')),
      verifyCommentOwner: vi.fn(),
      deleteComment: vi.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('thread-123', 'comment-xxx', 'user-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it('should throw error when user is not the comment owner', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
      verifyCommentOwner: vi.fn().mockRejectedValue(new Error('anda tidak berhak mengakses resource ini')),
      deleteComment: vi.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute('thread-123', 'comment-123', 'user-456'))
      .rejects.toThrowError('anda tidak berhak mengakses resource ini');
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });
});
