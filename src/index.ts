import { useState, useEffect, useRef } from 'react';

export interface UseCommentsComment {
  author: string;
  content: string;
  topic: string;
  createdAt: string;
  status?: UseCommentsStatus;
}

/**
 * Needed for optimistic update.
 * When the comment is submitted, it is `'sending'`.
 * When the request succeeds and the comment is not hidden in the database, it turns into `'added'`.
 * When the request succeeds and the comment is hidden and awaiting approval, we receive `'delivered-awaiting-approval'`.
 * When the request fails, the status is `'failed'`. - You can use this information to prompt user to retry.
 */
export type UseCommentsStatus =
  | 'sending'
  | 'added'
  | 'delivered-awaiting-approval'
  | 'failed';

/** @internal */
export interface FetchCommentsAPIPayload {
  projectId: string;
  topic: string;
  take?: number;
  skip?: number;
}

/** @internal */
export interface FetchCommentsAPIResponse {
  comments: UseCommentsComment[];
  count: number;
}

const _fetchComments = async (payload: FetchCommentsAPIPayload) => {
  const params = new URLSearchParams({
    projectId: payload.projectId,
    topic: payload.topic,
    ...(payload.skip && { skip: payload.skip.toString() }),
    ...(payload.take && { take: payload.take.toString() }),
  }).toString();
  const url = `https://www.commont.app/api/comments?${params}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const responseJson: FetchCommentsAPIResponse = await response.json();

  if (response.ok && responseJson) {
    return responseJson;
  }

  throw new Error('Empty API response');
};

/** @internal */
export interface AddCommentAPIPayload {
  projectId: string;
  topic: string;
  content: string;
  author: string;
}

/** @internal */
export interface AddCommentAPIResponse {
  comment: UseCommentsComment & {
    hidden: boolean;
  };
}

const _addComment = async (payload: AddCommentAPIPayload) => {
  const response = await fetch(
    `https://www.commont.app/api/add-comment?projectId=${payload.projectId}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const responseJson: AddCommentAPIResponse = await response.json();

  if (response.ok && responseJson) {
    return responseJson;
  }

  throw new Error('Empty API response');
};

export interface UseCommentsParameters {
  projectId: string;
  topic: string;
  take?: number;
  skip?: number;
}

export interface UseCommentsResult {
  comments: UseCommentsComment[];
  addComment: ({
    content,
    author,
  }: Pick<UseCommentsComment, 'content' | 'author'>) => void;
  refetch: () => void;
  count: number;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches comments from Commont's backend on mount and when
 * `config.take` or `config.skip` changes.
 *
 * @param projectId Id of your Commont's project
 * @param topic Comments will be fetched for a particular topic, e.g. my-post-about-cats.
 * @param take Number of comments to fetch.
 * @param skip Number of comments to skip.
 * @returns comments for given post, aggregated count of all comments, error,
 *          loading state and a function to refetch data from backend.
 */
export const useComments = ({
  projectId,
  topic,
  skip,
  take,
}: UseCommentsParameters): UseCommentsResult => {
  const [comments, setComments] = useState<UseCommentsComment[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMounted = useIsMounted();

  const fetchComments = () => {
    if (isMounted) {
      setLoading(true);
    }
    _fetchComments({
      projectId,
      topic,
      ...(take && { take }),
      ...(skip && { skip }),
    })
      .then(res => {
        if (isMounted) {
          setComments(res.comments);
          setCount(res.count);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });
  };

  useEffect(fetchComments, [take, skip]);

  const addComment = ({
    content,
    author,
  }: Pick<UseCommentsComment, 'content' | 'author'>) => {
    const createdAt = new Date().toString();

    const newComment: UseCommentsComment = {
      author,
      content,
      topic,
      createdAt,
      status: 'sending',
    };
    if (isMounted) {
      setComments(prev => [newComment, ...prev]);
      setCount(prev => ++prev);
    }

    _addComment({
      projectId,
      topic,
      content,
      author,
    })
      .then(res => {
        const remoteComment = res.comment;
        if (isMounted) {
          setComments(prev =>
            prev.map(x =>
              x === newComment
                ? {
                    ...remoteComment,
                    status: remoteComment.hidden
                      ? 'delivered-awaiting-approval'
                      : 'added',
                  }
                : x
            )
          );
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message);
          setComments(prev =>
            prev.map(x =>
              x === newComment
                ? {
                    ...newComment,
                    status: 'failed',
                  }
                : x
            )
          );
        }
      });
  };

  return {
    comments,
    addComment,
    refetch: fetchComments,
    count,
    loading,
    error,
  };
};

const useIsMounted = () => {
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  });
  return isMounted;
};
