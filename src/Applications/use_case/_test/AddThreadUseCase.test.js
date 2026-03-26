import { describe, it, expect, vi } from 'vitest';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = { title: 'sebuah thread', body: 'sebuah body thread' };
    const owner = 'user-123';

    const mockThreadRepository = {
      addThread: vi.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload, owner);

    // Assert
    expect(addedThread.id).toEqual('thread-123');
    expect(addedThread.title).toEqual('sebuah thread');
    expect(addedThread.owner).toEqual('user-123');
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner,
    });
  });
});
