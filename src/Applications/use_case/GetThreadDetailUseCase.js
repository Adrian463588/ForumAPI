export const DELETED_COMMENT_CONTENT = '**komentar telah dihapus**';
export const DELETED_REPLY_CONTENT = '**balasan telah dihapus**';

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const likeCounts = await this._likeRepository.getLikeCountsByCommentIds(commentIds);

    thread.comments = comments.map((comment) => this._mapComment(comment, replies, likeCounts));

    return thread;
  }

  _mapComment(comment, allReplies, likeCounts) {
    const commentReplies = allReplies
      .filter((reply) => reply.comment_id === comment.id)
      .map((reply) => this._mapReply(reply));

    const likeCountEntry = likeCounts.find((lc) => lc.comment_id === comment.id);

    return {
      id: comment.id,
      username: comment.username,
      date: comment.date,
      replies: commentReplies,
      content: comment.is_delete ? DELETED_COMMENT_CONTENT : comment.content,
      likeCount: likeCountEntry ? parseInt(likeCountEntry.like_count, 10) : 0,
    };
  }

  _mapReply(reply) {
    return {
      id: reply.id,
      content: reply.is_delete ? DELETED_REPLY_CONTENT : reply.content,
      date: reply.date,
      username: reply.username,
    };
  }
}

export default GetThreadDetailUseCase;
