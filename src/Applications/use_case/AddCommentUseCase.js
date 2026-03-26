import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    await this._threadRepository.verifyThreadExists(threadId);
    const newComment = new NewComment({ content: useCasePayload.content, threadId, owner });
    return this._commentRepository.addComment(newComment);
  }
}

export default AddCommentUseCase;
