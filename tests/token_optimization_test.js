/**
 * Test file to verify token optimization functionality
 * Run with: node tests/token_optimization_test.js
 */

import GeminiService from '../src/services/geminiService.js';

// Create test data
const originalStory = "I was walking down a dark alley when I heard footsteps behind me.";
const timeline = "Present day, urban setting";

// Create a long branch path to test optimization
const branchPath = [
  { aiResponse: "The footsteps grew closer and I could hear heavy breathing. My heart raced as I realized someone was definitely following me. I needed to make a decision quickly." },
  { 
    choice: "I turned around to confront whoever was following me", 
    aiResponse: "I spun around to face my pursuer. A tall figure in a dark coat stood about ten feet away, their face hidden in shadow. 'Who are you?' I demanded, my voice shaking slightly." 
  },
  { 
    choice: "I asked why they were following me", 
    aiResponse: "The figure stepped closer, and I could see it was a woman with concerned eyes. 'I'm sorry for scaring you,' she said softly. 'But I think you're in danger. I've been watching you because someone else has been watching you too.'" 
  },
  { 
    choice: "I asked her to explain what she meant", 
    aiResponse: "She glanced nervously around before speaking. 'There's a man in a red jacket who's been following you for three blocks. He's been taking photos with his phone. I think he's still behind us.' My blood ran cold." 
  },
  { 
    choice: "I looked back to see if the man was still there", 
    aiResponse: "I carefully turned to look behind her, and sure enough, there was a figure in a red jacket ducking behind a parked car. My heart pounded as I realized the danger was real." 
  },
  { 
    choice: "I thanked her and asked what we should do", 
    aiResponse: "She pulled out her phone. 'We need to get to a public place immediately. There's a 24-hour diner two blocks away. If he follows us there, we can call the police.' I nodded, grateful for her help." 
  },
  { 
    choice: "I agreed to go to the diner", 
    aiResponse: "We started walking quickly toward the diner, staying close together. I kept glancing back, and the man in the red jacket was definitely following us, maintaining his distance but never letting us out of sight." 
  },
  { 
    choice: "I suggested we run", 
    aiResponse: "We broke into a run, and I heard the man behind us start running too. The diner's neon sign came into view, and we burst through the door, breathing heavily. The waitress looked up in surprise as we rushed to a booth." 
  },
  { 
    choice: "I looked out the window to see if he followed", 
    aiResponse: "The man in the red jacket was standing across the street, staring directly at the diner. He pulled out his phone and made a call. My mysterious helper grabbed my arm. 'We need to call the police now,' she said urgently." 
  },
  { 
    choice: "I agreed to call the police", 
    aiResponse: "I dialed 911 while she kept watch. When the operator answered, I explained the situation. 'Stay where you are,' the operator said. 'Officers are on their way.' But when I looked up, the woman who had helped me was gone." 
  }
];

// Test token optimization
console.log('=== Token Optimization Test ===');

try {
  // Test with default settings
  console.log('\n1. Testing with default settings (maxRecentSteps=5):');
  const stats1 = GeminiService.getTokenStatistics(originalStory, timeline, branchPath);
  console.log('Token Statistics:', stats1);
  
  // Test with more aggressive optimization
  console.log('\n2. Testing with aggressive optimization (maxRecentSteps=3):');
  GeminiService.configureTokenOptimization({ maxRecentSteps: 3 });
  const stats2 = GeminiService.getTokenStatistics(originalStory, timeline, branchPath);
  console.log('Token Statistics:', stats2);
  
  // Test with less aggressive optimization
  console.log('\n3. Testing with less aggressive optimization (maxRecentSteps=7):');
  GeminiService.configureTokenOptimization({ maxRecentSteps: 7 });
  const stats3 = GeminiService.getTokenStatistics(originalStory, timeline, branchPath);
  console.log('Token Statistics:', stats3);
  
  // Test summarization directly
  console.log('\n4. Testing summarization directly:');
  GeminiService.configureTokenOptimization({ maxRecentSteps: 5 });
  const summary = GeminiService.summarizeBranchPath(branchPath, 5);
  console.log('Summary:', summary);
  
  console.log('\n=== Test Completed Successfully ===');
  
} catch (error) {
  console.error('Test failed:', error);
}