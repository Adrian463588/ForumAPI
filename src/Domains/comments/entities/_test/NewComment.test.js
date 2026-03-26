import { describe, it, expect } from 'vitest';
import NewComment from '../NewComment.js';

describe('NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = { content: 'content' };
    expect(() => new NewComment(payload)).toThrow('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = { content: 123, threadId: true, owner: [] };
    expect(() => new NewComment(payload)).toThrow('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment object correctly', () => {
    const payload = { content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' };
    const newComment = new NewComment(payload);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
