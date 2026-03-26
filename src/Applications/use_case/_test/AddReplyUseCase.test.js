import { describe, it, expect, vi } from 'vitest';
import AddReplyUseCase from '../AddReplyUseCase.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah balasan' };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(),
    };
    const mockReplyRepository = {
      addReply: vi.fn().mockResolvedValue({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload, threadId, commentId, owner);

    // Assert
    expect(addedReply.id).toEqual('reply-123');
    expect(addedReply.content).toEqual('sebuah balasan');
    expect(addedReply.owner).toEqual('user-123');
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(commentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith({
      content: useCasePayload.content,
      commentId,
      owner,
    });
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah balasan' };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(),
    };
    const mockReplyRepository = {
      addReply: vi.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload, 'thread-xxx', 'comment-123', 'user-123'))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });

  it('should throw error when comment does not exist', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah balasan' };

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockRejectedValue(new Error('komentar tidak ditemukan')),
    };
    const mockReplyRepository = {
      addReply: vi.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload, 'thread-123', 'comment-xxx', 'user-123'))
      .rejects.toThrowError('komentar tidak ditemukan');
    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });
});
