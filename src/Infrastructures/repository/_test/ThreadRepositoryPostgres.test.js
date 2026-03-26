import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return added thread correctly', async () => {
      // Arrange
      const newThread = { title: 'sebuah thread', body: 'sebuah body thread', owner: 'user-123' };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread detail correctly', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toBeDefined();
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-xxx'))
        .rejects.toThrow(new NotFoundError('thread tidak ditemukan'));
    });
  });

  describe('verifyThreadExists function', () => {
    it('should not throw error when thread exists', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-xxx'))
        .rejects.toThrow(new NotFoundError('thread tidak ditemukan'));
    });
  });
});
