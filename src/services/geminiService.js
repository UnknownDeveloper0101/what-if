import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  async generateStoryResponse(originalStory, timeline, currentChoice = null, storyHistory = []) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const prompt = this.buildPrompt(originalStory, timeline, currentChoice, storyHistory);
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 800,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        return generatedText;
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }

  buildPrompt(originalStory, timeline, currentChoice, storyHistory) {
    let prompt = `You are a master storyteller creating an interactive "What If" story. `;
    
    if (storyHistory.length === 0) {
      // Initial story generation
      prompt += `Based on the following story and timeline, create a detailed and engaging continuation that explores alternate possibilities.

Original Story: "${originalStory}"
Timeline: "${timeline}"

Please write a detailed, immersive story continuation (200-300 words) that:
1. Builds upon the original story
2. Takes place within the specified timeline
3. Creates dramatic tension and interesting possibilities
4. Sets up multiple potential paths for the story to continue
5. Uses vivid descriptions and engaging narrative style
6. Ends with a sense of anticipation for what could happen next

Write in an engaging, narrative style that draws the reader in.`;
    } else {
      // Continuation based on choice
      prompt += `Continue the following story based on the user's choice.

Original Story: "${originalStory}"
Timeline: "${timeline}"

Story History:
${storyHistory.map((entry, index) => `${index + 1}. Choice made: "${entry.choice}"\n   Result: ${entry.result.substring(0, 100)}...`).join('\n')}

Current Choice: "${currentChoice}"

Please write a detailed continuation (200-300 words) that:
1. Logically follows from the chosen path
2. Develops the story in an interesting direction
3. Introduces new challenges or developments
4. Maintains narrative consistency with previous choices
5. Creates opportunities for the next set of choices
6. Uses engaging, immersive storytelling

Write in an engaging, narrative style.`;
    }

    return prompt;
  }

  async generateStoryOptions(storyContext, currentStoryPart) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const prompt = `Based on the following story context and current situation, generate exactly 4 distinct, engaging story options for what could happen next.

Story Context: "${storyContext}"
Current Situation: "${currentStoryPart.substring(0, 300)}..."

Generate 4 different options that:
1. Are distinct from each other and lead to different outcomes
2. Are each 15-25 words long
3. Are engaging and create different types of dramatic tension
4. Offer different risk levels and approaches
5. Are realistic within the story's context

Format your response as a numbered list:
1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]

Only return the numbered list, nothing else.`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        return this.parseOptions(generatedText);
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error generating options:', error);
      // Return default options if API fails
      return this.getDefaultOptions();
    }
  }

  parseOptions(text) {
    const lines = text.split('\n').filter(line => line.trim().match(/^\d+\./));
    const options = lines.map(line => {
      return line.replace(/^\d+\.\s*/, '').trim();
    });

    // Ensure we have exactly 4 options
    while (options.length < 4) {
      options.push(...this.getDefaultOptions().slice(options.length));
    }

    return options.slice(0, 4);
  }

  getDefaultOptions() {
    return [
      "Take a bold and risky approach that could lead to great rewards or devastating consequences",
      "Choose the safe, calculated path that ensures stability but might limit growth",
      "Seek help from an unexpected ally who may have hidden motives",
      "Embrace the chaos and let fate decide the outcome"
    ];
  }
}

export default new GeminiService();