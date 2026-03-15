import type { Meta, StoryObj } from '@storybook/react';
import { Cover1A, Cover1B, Cover2A, Cover2B } from './CoverConcepts';

const meta = {
  title: 'Concepts/Covers',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '375px', height: '812px', border: '1px solid #ccc', margin: '20px auto', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

export const Concept1A_Minimal: StoryObj<typeof Cover1A> = {
  render: () => <Cover1A onStart={() => alert('Start!')} />,
};

export const Concept1B_Analytical: StoryObj<typeof Cover1B> = {
  render: () => <Cover1B onStart={() => alert('Start!')} />,
};

export const Concept2A_Friendly: StoryObj<typeof Cover2A> = {
  render: () => <Cover2A onStart={() => alert('Start!')} />,
};

export const Concept2B_Warm: StoryObj<typeof Cover2B> = {
  render: () => <Cover2B onStart={() => alert('Start!')} />,
};
