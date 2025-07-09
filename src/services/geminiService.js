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

  async generateStoryResponse(originalStory, timeline, currentChoice = null, branchPath = []) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const messages = this.buildMessageHistory(originalStory, timeline, currentChoice, branchPath);
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 600,
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
      
      // Log more detailed error information
      if (error.response) {
        console.error('API Response Status:', error.response.status);
        console.error('API Response Data:', error.response.data);
        
        // Check for specific error types
        if (error.response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (error.response.status === 400) {
          throw new Error('Invalid request. The story content may be too long or contain inappropriate content.');
        } else if (error.response.status === 403) {
          throw new Error('API key is invalid or has insufficient permissions.');
        } else {
          throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }

  buildMessageHistory(originalStory, timeline, currentChoice, branchPath) {
    const messages = [];
    
    // Check if the branch path is getting too long (could cause context overflow)
    if (branchPath.length > 8) {
      console.warn('Branch path is getting very long, this may cause API issues');
    }
    
    // System message - using user role with system instructions
    messages.push({
      role: "user",
      parts: [{
        text: `You are a master storyteller creating immersive "What If" story continuations. Your role is to write detailed, engaging narrative continuations only - never include multiple story paths, choices, or options within your story response. Always maintain context and continuity.

CRITICAL RULES:
- Write only ONE single narrative continuation
- Never include multiple paths (Path A, Path B, etc.) in your story
- Never include choices or options within your narrative
- Focus on detailed, immersive storytelling
- End with narrative tension that sets up future possibilities
- Do not write "What happens next?" or provide choices

NARRATIVE CONSISTENCY RULES:
- MAINTAIN the same narrative perspective as the original story (first person "I" vs third person "he/she")
- If the original story uses "I", continue in first person throughout
- If the original story uses "he/she", continue in third person throughout
- DO NOT invent or make up names for characters unless they were provided in the original story
- Keep characters as generic references (the girl, she, her, etc.) unless names were given
- This keeps the story relatable and universal rather than overly specific`
      }]
    });

    if (branchPath.length === 0) {
      // Initial story generation
      messages.push({
        role: "user",
        parts: [{
          text: `My original story: "${originalStory}"\nTimeline: "${timeline}"\n\nBased on this story and timeline, create a detailed and engaging continuation that explores what happens next.

REQUIREMENTS:
- Write exactly ONE narrative continuation (250-350 words)
- Focus on immersive storytelling with rich details and emotions
- Build dramatic tension and develop the scenario naturally
- Use vivid descriptions and engaging narrative style
- End with anticipation for what could happen next
- Do NOT include multiple story paths within your response
- Do NOT include choices or options within your narrative
- Do NOT write "Path A," "Path B," or similar constructs
- Simply tell the story as it unfolds in this timeline

NARRATIVE CONSISTENCY REQUIREMENTS:
- MAINTAIN the same narrative perspective as the original story (first person "I" vs third person "he/she")
- If the original story uses "I", continue in first person throughout ("I saw...", "I felt...")
- If the original story uses "he/she", continue in third person throughout  
- DO NOT invent or make up names for characters unless they were provided in the original story
- Keep characters as generic references (the girl, she, her, etc.) unless names were explicitly given
- This keeps the story relatable and universal rather than overly specific

Write only the story continuation, nothing else.`
        }]
      });
    } else {
      // Build the full conversation history
      messages.push({
        role: "user",
        parts: [{
          text: `My original story: "${originalStory}"\nTimeline: "${timeline}"`
        }]
      });

      // Add each step in the branch path
      branchPath.forEach((step, index) => {
        if (index === 0) {
          // First AI response (initial story continuation)
          messages.push({
            role: "model",
            parts: [{
              text: step.aiResponse
            }]
          });
        } else {
          // User choice
          if (step.choice) {
            messages.push({
              role: "user",
              parts: [{
                text: `I chose: ${step.choice}`
              }]
            });
          }
          
          // AI response to that choice
          if (step.aiResponse) {
            messages.push({
              role: "model",
              parts: [{
                text: step.aiResponse
              }]
            });
          }
        }
      });

      // Add the current choice
      if (currentChoice) {
        messages.push({
          role: "user",
          parts: [{
            text: `I chose: ${currentChoice}\n\nContinue this story based on my choice.

REQUIREMENTS:
- Write exactly ONE narrative continuation (250-350 words)
- Keep all context and maintain consistency with previous choices
- Add vivid details and emotional depth
- Develop the story logically from the chosen path
- Introduce new developments or challenges naturally
- Use engaging narrative style with rich descriptions
- End with narrative tension for future possibilities
- Do NOT include multiple story paths within your response
- Do NOT include choices or options within your narrative
- Simply continue the story as it unfolds

NARRATIVE CONSISTENCY REQUIREMENTS:
- MAINTAIN the same narrative perspective as the original story (first person "I" vs third person "he/she")
- If the original story uses "I", continue in first person throughout ("I saw...", "I felt...")
- If the original story uses "he/she", continue in third person throughout  
- DO NOT invent or make up names for characters unless they were provided in the original story
- Keep characters as generic references (the girl, she, her, etc.) unless names were explicitly given
- This keeps the story relatable and universal rather than overly specific

Write only the story continuation, nothing else.`
          }]
        });
      }
    }

    return messages;
  }

  async generateStoryOptions(originalStory, timeline, currentStoryPart, branchPath = []) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      const messages = this.buildMessageHistory(originalStory, timeline, null, branchPath);
      
      // Add the current story part and request for options
      // Use the full story or last 500 characters to capture the ending
      const storyContext = currentStoryPart.length > 500 ? 
        "..." + currentStoryPart.substring(currentStoryPart.length - 500) : 
        currentStoryPart;
      
      messages.push({
        role: "user",
        parts: [{
          text: `Here is the current story situation: "${storyContext}"\n\nGenerate exactly 4 distinct, engaging story options for what could happen next.

CRITICAL INSTRUCTIONS:
- Read the ENTIRE story context above carefully, especially the ending
- The options must continue logically from where the story actually ends
- Pay attention to the final scene, the protagonist's current situation, and what opportunities or challenges are presented
- Consider what the protagonist has just discovered or experienced
- Think about the protagonist's emotional state and immediate circumstances

REQUIREMENTS:
- Create 4 different options that are distinct from each other
- Each option should be 15-25 words long
- Options should be engaging and create different types of dramatic tension
- Offer different risk levels and approaches to the current situation
- Make them realistic within the story's context and current circumstances
- Each option must logically continue from the current story's ending point
- Consider what the protagonist could realistically do based on their current situation
- Focus on immediate next actions the protagonist could take

NARRATIVE CONSISTENCY FOR OPTIONS:
- MAINTAIN the same narrative perspective as the story (first person "I" vs third person "he/she")
- If the story uses "I", write options in first person ("I decide to...", "I walk toward...")
- If the story uses "he/she", write options in third person ("He decides to...", "She walks toward...")
- DO NOT invent or make up names for characters unless they were provided in the original story
- Keep characters as generic references (the girl, she, her, etc.) unless names were explicitly given

Format your response as a numbered list:
1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]

Return only the numbered list, nothing else.`
        }]
      });

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: messages,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 250,
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
      
      // Log more detailed error information
      if (error.response) {
        console.error('Options API Response Status:', error.response.status);
        console.error('Options API Response Data:', error.response.data);
      }
      
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