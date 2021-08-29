import { useComments } from '../src/';

import { AddComment } from './AddComment';

export const PostComments = ({
  slug,
  projectId,
  take,
  skip,
}: {
  slug: string;
  projectId: string;
  take?: number;
  skip?: number;
}) => {
  const { comments, count, loading, addComment, error } = useComments({
    projectId,
    topic: slug,
    take,
    skip,
  });

  return (
    <section>
      <AddComment onSubmit={addComment} />

      <h3>{count === 1 ? '1 comment' : `${count} comments`}</h3>
      {error && <p>Error: {error}</p>}
      {loading
        ? 'Loading comments...'
        : comments.map(({ author, content, createdAt }, i) => (
            <article key={i}>
              <div>
                {author} ・ {new Date(createdAt).toLocaleDateString()}
              </div>
              <p>{content}</p>
            </article>
          ))}
    </section>
  );
};
