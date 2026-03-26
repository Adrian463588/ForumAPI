import express from 'express';
import createAuthenticationMiddleware from '../../../../Infrastructures/security/AuthenticationMiddleware.js';

const createRepliesRouter = (handler, container) => {
  const router = express.Router({ mergeParams: true });
  const authMiddleware = createAuthenticationMiddleware(container);

  router.post('/', authMiddleware, handler.postReplyHandler);
  router.delete('/:replyId', authMiddleware, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;
