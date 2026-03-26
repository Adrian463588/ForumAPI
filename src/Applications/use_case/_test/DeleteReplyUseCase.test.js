import { describe, it, expect, vi } from 'vitest';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockReplyRepository = {
      verifyReplyExists: vi.fn().mockResolvedValue(),
      verifyReplyOwner: vi.fn().mockResolvedValue(),
      deleteReply: vi.fn().mockResolvedValue(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(threadId, commentId, replyId, owner);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(replyId, owner);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(replyId);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(),
    };
    const mockReplyRepository = {
      verifyReplyExists: vi.fn(),
      verifyReplyOwner: vi.fn(),
      deleteReply: vi.fn(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute('thread-xxx', 'comment-123', 'reply-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReply).not.toHaveBeenCalled();
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockRejectedValue(new Error('komentar tidak ditemukan')),
    };
    const mockReplyRepository = {
      verifyReplyExists: vi.fn(),
      verifyReplyOwner: vi.fn(),
      deleteReply: vi.fn(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute('thread-123', 'comment-xxx', 'reply-123', 'user-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
    expect(mockReplyRepository.verifyReplyExists).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReply).not.toHaveBeenCalled();
  });

  it('should throw error when reply does not exist', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockReplyRepository = {
      verifyReplyExists: vi.fn().mockRejectedValue(new Error('balasan tidak ditemukan')),
      verifyReplyOwner: vi.fn(),
      deleteReply: vi.fn(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute('thread-123', 'comment-123', 'reply-xxx', 'user-123'))
      .rejects.toThrowError('balasan tidak ditemukan');
    expect(mockReplyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(mockReplyRepository.deleteReply).not.toHaveBeenCalled();
  });

  it('should throw error when user is not the reply owner', async () => {
    // Arrange
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockReplyRepository = {
      verifyReplyExists: vi.fn().mockResolvedValue(),
      verifyReplyOwner: vi.fn().mockRejectedValue(new Error('anda tidak berhak mengakses resource ini')),
      deleteReply: vi.fn(),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute('thread-123', 'comment-123', 'reply-123', 'user-456'))
      .rejects.toThrowError('anda tidak berhak mengakses resource ini');
    expect(mockReplyRepository.deleteReply).not.toHaveBeenCalled();
  });
});
