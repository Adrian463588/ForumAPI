import { describe, it, expect } from 'vitest';
import AddedThread from '../AddedThread.js';

describe('AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { id: 'thread-123', title: 'title' };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { id: 123, title: 'title', owner: true };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
