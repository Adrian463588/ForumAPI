import { describe, it, expect } from 'vitest';
import NewThread from '../NewThread.js';

describe('NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = { title: 'title' };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrow('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = { title: 123, body: true };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrow('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title exceeds character limit', () => {
    // Arrange
    const payload = { title: 'a'.repeat(101), body: 'body' };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrow('NEW_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create NewThread object correctly', () => {
    // Arrange
    const payload = { title: 'sebuah thread', body: 'body thread' };

    // Action
    const newThread = new NewThread(payload);

    // Assert
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
