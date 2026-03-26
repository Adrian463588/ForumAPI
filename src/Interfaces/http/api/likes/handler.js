import ToggleCommentLikeUseCase from '../../../../Applications/use_case/ToggleCommentLikeUseCase.js';

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const { id: credentialId } = req.auth.credentials;
      const { threadId, commentId } = req.params;
      const toggleCommentLikeUseCase = this._container.getInstance(ToggleCommentLikeUseCase.name);
      await toggleCommentLikeUseCase.execute(threadId, commentId, credentialId);

      res.json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LikesHandler;
