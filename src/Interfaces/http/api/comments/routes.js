import express from 'express';
import createAuthenticationMiddleware from '../../../../Infrastructures/security/AuthenticationMiddleware.js';

const createCommentsRouter = (handler, container) => {
  const router = express.Router({ mergeParams: true });
  const authMiddleware = createAuthenticationMiddleware(container);

  router.post('/', authMiddleware, handler.postCommentHandler);
  router.delete('/:commentId', authMiddleware, handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
