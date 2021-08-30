import {
  UseCommentsComment,
  FetchCommentsAPIPayload,
  FetchCommentsAPIResponse,
  AddCommentAPIPayload,
  AddCommentAPIResponse,
} from '../../src';
import { rest } from 'msw';

const comments: UseCommentsComment[] = [
  {
    author: 'Aleksandra',
    content: 'What a cute dog!',
    createdAt: new Date().toString(),
    topic: 'dogs',
  },
  {
    author: 'Aleksandra',
    content: 'Just testing',
    createdAt: new Date().toString(),
    topic: 'test',
  },
  {
    author: 'Johnny Test',
    content: 'Testing some more!',
    createdAt: new Date().toString(),
    topic: 'test',
  },
  {
    author: 'Mary',
    content: 'Thanks for your post',
    createdAt: new Date().toString(),
    topic: 'test',
  },
];

export const handlers = [
  rest.get<FetchCommentsAPIPayload, FetchCommentsAPIResponse>(
    'https://www.commont.app/api/comments',
    (req, res, ctx) => {
      const projectId = req.url.searchParams.get('projectId');
      const topic = req.url.searchParams.get('topic');
      const take = req.url.searchParams.get('take');
      const skip = req.url.searchParams.get('skip');

      if (!projectId || !topic) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Missing required parameters',
          })
        );
      }

      const currentComments = comments
        .filter(c => c.topic === topic)
        .slice(skip ? parseInt(skip) : 0, take ? parseInt(take) : undefined);

      const currentCommentsCount = comments.filter(c => c.topic === topic)
        .length;

      return res(
        ctx.json({
          comments: currentComments,
          count: currentCommentsCount,
        })
      );
    }
  ),
  rest.post<AddCommentAPIPayload, AddCommentAPIResponse>(
    'https://www.commont.app/api/add-comment',
    (req, res, ctx) => {
      const { author, content, topic } = req.body;

      if (!author || !content) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Missing required parameters' })
        );
      }

      const newComment = {
        author,
        content,
        topic,
        createdAt: new Date().toString(),
        hidden: false,
      };

      comments.push(newComment);

      return res(ctx.json({ comment: newComment }));
    }
  ),
];
