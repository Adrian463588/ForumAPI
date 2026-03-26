class LikeRepository {
  async checkLikeExists(_userId, _commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addLike(_userId, _commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async removeLike(_userId, _commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getLikeCountsByCommentIds(_commentIds) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

export default LikeRepository;
