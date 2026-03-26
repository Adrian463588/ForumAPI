import { describe, it, expect, vi } from 'vitest';
import AddCommentUseCase from '../AddCommentUseCase.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah comment' };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      addComment: vi.fn().mockResolvedValue({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      }),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload, threadId, owner);

    // Assert
    expect(addedComment.id).toEqual('comment-123');
    expect(addedComment.content).toEqual('sebuah comment');
    expect(addedComment.owner).toEqual('user-123');
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith({
      content: useCasePayload.content,
      threadId,
      owner,
    });
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = { content: 'sebuah comment' };
    const threadId = 'thread-xxx';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      addComment: vi.fn(),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload, threadId, owner))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });
});
