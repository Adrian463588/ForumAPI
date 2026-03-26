/* eslint-disable camelcase */
import { describe, it, expect, vi } from 'vitest';
import GetThreadDetailUseCase, { DELETED_COMMENT_CONTENT, DELETED_REPLY_CONTENT } from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'sebuah comment',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'sebuah balasan',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        is_delete: false,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-123',
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        is_delete: true,
      },
    ];

    const mockLikeCounts = [
      { comment_id: 'comment-123', like_count: '2' },
    ];

    const mockThreadRepository = {
      getThreadById: vi.fn().mockResolvedValue(mockThread),
    };
    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn().mockResolvedValue(mockComments),
    };
    const mockReplyRepository = {
      getRepliesByCommentIds: vi.fn().mockResolvedValue(mockReplies),
    };
    const mockLikeRepository = {
      getLikeCountsByCommentIds: vi.fn().mockResolvedValue(mockLikeCounts),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-123', 'comment-456']);
    expect(mockLikeRepository.getLikeCountsByCommentIds).toHaveBeenCalledWith(['comment-123', 'comment-456']);

    expect(threadDetail.id).toEqual('thread-123');
    expect(threadDetail.title).toEqual('sebuah thread');
    expect(threadDetail.body).toEqual('sebuah body thread');
    expect(threadDetail.date).toEqual('2021-08-08T07:19:09.775Z');
    expect(threadDetail.username).toEqual('dicoding');

    // verify comments with soft-delete mapping
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].content).toEqual('sebuah comment');
    expect(threadDetail.comments[1].content).toEqual(DELETED_COMMENT_CONTENT);

    // verify likeCount
    expect(threadDetail.comments[0].likeCount).toEqual(2);
    expect(threadDetail.comments[1].likeCount).toEqual(0); // no likes for deleted comment

    // verify replies with soft-delete mapping
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0].content).toEqual('sebuah balasan');
    expect(threadDetail.comments[0].replies[1].content).toEqual(DELETED_REPLY_CONTENT);

    // verify deleted comment has empty replies
    expect(threadDetail.comments[1].replies).toHaveLength(0);
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const threadId = 'thread-xxx';

    const mockThreadRepository = {
      getThreadById: vi.fn().mockRejectedValue(new Error('thread tidak ditemukan')),
    };
    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn(),
    };
    const mockReplyRepository = {
      getRepliesByCommentIds: vi.fn(),
    };
    const mockLikeRepository = {
      getLikeCountsByCommentIds: vi.fn(),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute(threadId))
      .rejects.toThrowError('thread tidak ditemukan');
    expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
    expect(mockLikeRepository.getLikeCountsByCommentIds).not.toHaveBeenCalled();
  });
});
