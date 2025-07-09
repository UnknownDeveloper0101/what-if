import React from 'react';
import StoryCard from './StoryCard';
import OptionCard from './OptionCard';
import CustomOptionCard from './CustomOptionCard';
import OptionsGrid from './OptionsGrid';
import EndBranchCard from './EndBranchCard';

const StoryExample = () => {
  const handleOptionClick = (optionText) => {
    console.log('Option clicked:', optionText);
  };

  const handleCustomOption = (customText) => {
    console.log('Custom option submitted:', customText);
  };

  const handleNewBranch = () => {
    console.log('Starting new branch...');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#00FF7F', textAlign: 'center', marginBottom: '2rem' }}>
        Story Components Demo
      </h1>
      
      {/* Root Story Card */}
      <StoryCard
        title="Your What If"
        text="What if I had talked to her at the coffee shop that day instead of just walking past?"
        subtitle="Timeline: a year later"
        size="large"
        breadcrumb="Root"
      />

      {/* AI Response Card */}
      <StoryCard
        title="AI Response"
        text="You return to the same coffee shop, hoping against hope that she might be there. The familiar aroma of espresso fills your nostrils as you scan the room. And there she is, sitting in the corner booth, reading a book with her hair cascading over her shoulder just like you remembered."
        breadcrumb="Choice 1"
      >
        <OptionsGrid title="What happens next?">
          <OptionCard
            text="Walk over and say hello"
            onClick={() => handleOptionClick('Walk over and say hello')}
          />
          <OptionCard
            text="Order a coffee and sit nearby"
            onClick={() => handleOptionClick('Order a coffee and sit nearby')}
          />
          <OptionCard
            text="Leave immediately - you've lost your nerve"
            onClick={() => handleOptionClick('Leave immediately')}
          />
          <OptionCard
            text="End This Branch"
            onClick={() => handleOptionClick('End branch')}
            variant="end"
          />
          <CustomOptionCard
            onSubmit={handleCustomOption}
            placeholder="Or describe your own action..."
          />
        </OptionsGrid>
      </StoryCard>

      {/* Another story continuation */}
      <StoryCard
        title="AI Response"
        text="You take a deep breath and walk over to her table. She looks up from her book - 'The Great Gatsby' - and smiles. 'Excuse me,' you say, 'I know this might sound strange, but I feel like I've seen you here before...'"
        breadcrumb="Choice 2"
      >
        <OptionsGrid>
          <OptionCard
            text="Continue the conversation"
            onClick={() => handleOptionClick('Continue conversation')}
          />
          <OptionCard
            text="Compliment her book choice"
            onClick={() => handleOptionClick('Compliment book')}
          />
          <OptionCard
            text="End This Branch"
            onClick={() => handleOptionClick('End branch')}
            variant="end"
          />
        </OptionsGrid>
      </StoryCard>

      {/* End Branch Card */}
      <EndBranchCard
        title="THE END"
        message="This branch is closed. Start a new one?"
        onNewBranch={handleNewBranch}
      />
    </div>
  );
};

export default StoryExample;