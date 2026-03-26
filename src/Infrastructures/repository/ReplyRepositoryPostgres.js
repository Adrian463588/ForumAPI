import ReplyRepository from '../../Domains/replies/ReplyRepository.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, comment_id, content, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `SELECT replies.id, replies.comment_id, replies.content, replies.date, users.username, replies.is_delete
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             WHERE replies.comment_id = ANY($1::text[])
             ORDER BY replies.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }
}

export default ReplyRepositoryPostgres;
