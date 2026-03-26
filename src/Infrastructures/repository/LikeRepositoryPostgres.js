import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkLikeExists(userId, commentId) {
    const query = {
      text: 'SELECT id FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async addLike(userId, commentId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes (id, user_id, comment_id) VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async removeLike(userId, commentId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async getLikeCountsByCommentIds(commentIds) {
    const query = {
      text: `SELECT comment_id, COUNT(*) as like_count
             FROM user_comment_likes
             WHERE comment_id = ANY($1::text[])
             GROUP BY comment_id`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;
