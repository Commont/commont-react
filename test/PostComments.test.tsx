import { act, render, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';

import { PostComments } from '../examples/PostComments';

describe(PostComments, () => {
  it('renders existing comments from API', async () => {
    const { findByText } = render(
      <PostComments slug="test" projectId="test-1" />
    );
    await findByText('Just testing');
    await findByText(/Aleksandra/);
    await findByText('Testing some more!');
    await findByText(/Johnny Test/);
    await findByText('3 comments');
  });

  it('allows adding new comments', async () => {
    const { findByText, findByLabelText } = render(
      <PostComments slug="test" projectId="test-1" />
    );
    const nameInput = await findByLabelText('Name');
    const textarea = await findByLabelText('Comment');
    user.type(nameInput, 'Tester');
    user.type(textarea, "What's up?");

    await act(async () => {
      const button = await findByText('Add comment');
      user.click(button);
    });

    await waitFor(async () => {
      await findByText('4 comments');
      await findByText("What's up?");
    });
  });

  it('shows error on invalid addComment data', async () => {
    const { findByText, findByLabelText } = render(
      <PostComments slug="" projectId="test-1" />
    );
    const nameInput = await findByLabelText('Name');
    const textarea = await findByLabelText('Comment');
    user.type(nameInput, 'Tester');
    user.type(textarea, "What's up?");

    await act(async () => {
      const button = await findByText('Add comment');
      user.click(button);
    });

    await waitFor(async () => {
      await findByText('Error: Missing required parameters');
    });
  });

  it('filters comments by topic', async () => {
    const { findByText } = render(
      <PostComments slug="dogs" projectId="test-1" />
    );
    await findByText('1 comment');
  });

  it('shows error on empty topic', async () => {
    const { findByText } = render(<PostComments slug="" projectId="test-1" />);

    await act(async () => {
      await findByText('0 comments');
      await findByText('Error: Missing required parameters');
    });
  });

  it('shows error on empty project', async () => {
    const { findByText } = render(<PostComments slug="test" projectId="" />);

    await act(async () => {
      await findByText('0 comments');
      await findByText('Error: Missing required parameters');
    });
  });

  it('handles pagination — takes two comments', async () => {
    const { findByText } = render(
      <PostComments slug="test" projectId="test" take={2} />
    );

    await findByText('Just testing');
    await findByText(/Aleksandra/);
    await findByText('Testing some more!');
    await findByText(/Johnny Test/);
    await findByText('4 comments');
  });

  it('handles pagination — skips two comments and takes one', async () => {
    const { findByText } = render(
      <PostComments slug="test" projectId="test" skip={2} />
    );

    await findByText(/Mary/);
    await findByText(/Tester/);
    await findByText('4 comments');
  });
});
