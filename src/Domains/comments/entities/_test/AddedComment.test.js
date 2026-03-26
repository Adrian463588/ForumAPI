import { describe, it, expect } from 'vitest';
import AddedComment from '../AddedComment.js';

describe('AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = { id: 'comment-123', content: 'content' };
    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = { id: 123, content: true, owner: [] };
    expect(() => new AddedComment(payload)).toThrow('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    const payload = { id: 'comment-123', content: 'sebuah comment', owner: 'user-123' };
    const addedComment = new AddedComment(payload);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
