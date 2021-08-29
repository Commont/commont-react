import React, { useState } from 'react';
import { UseCommentsComment } from '../src/';

interface AddCommentProps {
  onSubmit(values: Pick<UseCommentsComment, 'author' | 'content'>): void;
}
export const AddComment = ({ onSubmit }: AddCommentProps) => {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ content: comment, author: username });
        setUsername('');
        setComment('');
      }}
    >
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Jon Snow"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="comment">Comment</label>
        <textarea
          id="comment"
          name="comment"
          rows={2}
          placeholder="Tell me what you think 😊"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>
      <button type="submit">Add comment</button>
    </form>
  );
};
