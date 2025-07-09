import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('gemini_api_key') || '';
    this.maxRecentSteps = 5; // Configurable: how many recent steps to keep in full detail
    this.tokenWarningThreshold = 8000; // Warn when approaching token limits
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
  }

  hasApiKey() {
    return !!this.apiKey;
  }

  /**
   * Configure token optimization settings
   * @param {Object} options - Configuration options
   * @param {number} options.maxRecentSteps - Number of recent steps to keep in full detail
   * @param {number} options.tokenWarningThreshold - Token count threshold for warnings
   */
  configureTokenOptimization(options) {
    if (options.maxRecentSteps !== undefined) {
      this.maxRecentSteps = Math.max(1, Math.min(10, options.maxRecentSteps));
    }
    if (options.tokenWarningThreshold !== undefined) {
      this.tokenWarningThreshold = Math.max(1000, options.tokenWarningThreshold);
    }
    console.log(`Token optimization configured: maxRecentSteps=${this.maxRecentSteps}, tokenWarningThreshold=${this.tokenWarningThreshold}`);
  }

  /**
   * Get token usage statistics for current state
   * @param {string} originalStory - The original story
   * @param {string} timeline - The timeline
   * @param {Array} branchPath - The branch path
   * @returns {Object} - Token usage statistics
   */
  getTokenStatistics(originalStory, timeline, branchPath) {
    const messages = this.buildMessageHistory(originalStory, timeline, null, branchPath);
    const totalTokens = this.calculateMessageTokens(messages);
    
    // Calculate what the token count would be without summarization
    const messagesWithoutSummary = this.buildMessageHistoryWithoutSummary(originalStory, timeline, null, branchPath);
    const tokensWithoutSummary = this.calculateMessageTokens(messagesWithoutSummary);
    
    return {
      totalTokens,
      tokensWithoutSummary,
      tokensSaved: tokensWithoutSummary - totalTokens,
      branchPathLength: branchPath.length,
      recentStepsIncluded: Math.min(branchPath.length, this.maxRecentSteps),
      oldStepsSummarized: Math.max(0, branchPath.length - this.maxRecentSteps),
      isNearLimit: totalTokens > this.tokenWarningThreshold
    };
  }

  /**
   * Helper method to build message history without summarization (for comparison)
   */
  buildMessageHistoryWithoutSummary(originalStory, timeline, currentChoice, branchPath) {
    const messages = [];
    
    // System message (same as optimized version)
    messages.push({
      role: "user",
      parts: [{
        text: `You are a master storyteller creating immersive "What If" story continuations...`
      }]
    });

    if (branchPath.length === 0) {
      messages.push({
        role: "user",
        parts: [{
          text: `My original story: "${originalStory}"\nTimeline: "${timeline}"\n\nBased on this story and timeline, create a detailed and engaging continuation...`
        }]
      });
    } else {
      // Include ALL branch path steps without summarization
      messages.push({
        role: "user",
        parts: [{
          text: `My original story: "${originalStory}"\nTimeline: "${timeline}"`
        }]
      });

      branchPath.forEach((step, index) => {
        if (index === 0) {
          messages.push({
            role: "model",
            parts: [{ text: step.aiResponse }]
          });
        } else {
          if (step.choice) {
            messages.push({
              role: "user",
              parts: [{ text: `I chose: ${step.choice}` }]
            });
          }
          if (step.aiResponse) {
            messages.push({
              role: "model",
              parts: [{ text: step.aiResponse }]
            });
          }
        }
      });
    }

    return messages;
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

  /**
   * Estimates token count for a given text (rough approximation)
   * @param {string} text - The text to estimate tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokenCount(text) {
    // Rough approximation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculates total token count for message history
   * @param {Array} messages - Array of messages
   * @returns {number} - Estimated total token count
   */
  calculateMessageTokens(messages) {
    let totalTokens = 0;
    messages.forEach(message => {
      message.parts.forEach(part => {
        totalTokens += this.estimateTokenCount(part.text);
      });
    });
    return totalTokens;
  }

  /**
   * Summarizes older branch path entries to reduce token usage
   * @param {Array} branchPath - The full branch path
   * @param {number} recentSteps - Number of recent steps to keep in full
   * @returns {string} - Summary of older choices and outcomes
   */
  summarizeBranchPath(branchPath, recentSteps = 5) {
    if (branchPath.length <= recentSteps) {
      return null; // No need to summarize
    }

    const olderSteps = branchPath.slice(0, -recentSteps);
    const themes = new Set();
    const outcomes = new Set();
    const emotions = new Set();
    const keyEvents = new Set();

    olderSteps.forEach((step, index) => {
      if (step.aiResponse) {
        const response = step.aiResponse.toLowerCase();
        
        // Extract themes and approaches
        if (response.match(/risk|danger|hazard|peril|threat/)) themes.add('risky paths');
        if (response.match(/safe|careful|cautious|prudent/)) themes.add('cautious approaches');
        if (response.match(/bold|brave|courageous|daring/)) themes.add('bold decisions');
        if (response.match(/help|assist|support|aid/)) themes.add('seeking help');
        if (response.match(/alone|solo|independent|self/)) themes.add('going it alone');
        
        // Extract key outcomes
        if (response.match(/betray|deceive|lie|cheat|backstab/)) outcomes.add('betrayal');
        if (response.match(/secret|hidden|concealed|mystery/)) outcomes.add('hidden secrets');
        if (response.match(/reunion|meet|encounter|find.*again/)) outcomes.add('reunion');
        if (response.match(/conflict|fight|battle|struggle|confrontation/)) outcomes.add('conflict');
        if (response.match(/discover|found|reveal|uncover/)) outcomes.add('discovery');
        if (response.match(/escape|flee|run|evade/)) outcomes.add('escape');
        if (response.match(/love|romance|kiss|heart|feelings/)) outcomes.add('romance');
        if (response.match(/death|die|killed|murder/)) outcomes.add('death');
        if (response.match(/success|achieve|accomplish|triumph/)) outcomes.add('success');
        if (response.match(/fail|failure|defeat|loss/)) outcomes.add('failure');
        
        // Extract emotional states
        if (response.match(/fear|afraid|scared|terror/)) emotions.add('fear');
        if (response.match(/anger|rage|fury|mad/)) emotions.add('anger');
        if (response.match(/sad|grief|mourn|sorrow/)) emotions.add('sadness');
        if (response.match(/joy|happy|elated|excited/)) emotions.add('joy');
        if (response.match(/hope|optimism|confidence/)) emotions.add('hope');
        if (response.match(/despair|hopeless|desperat/)) emotions.add('despair');
        
        // Extract key events
        if (response.match(/attack|assault|violence/)) keyEvents.add('violence');
        if (response.match(/journey|travel|quest|adventure/)) keyEvents.add('journey');
        if (response.match(/transform|change|become/)) keyEvents.add('transformation');
        if (response.match(/trap|caught|prison/)) keyEvents.add('entrapment');
        if (response.match(/power|strength|ability|magic/)) keyEvents.add('power');
      }
    });

    // Build intelligent summary
    let summary = "Previously, the user chose ";
    
    // Add themes if any
    if (themes.size > 0) {
      summary += Array.from(themes).join(' and ') + " ";
    } else {
      summary += "various paths ";
    }
    
    // Add outcomes and events
    const allElements = [...outcomes, ...keyEvents];
    if (allElements.length > 0) {
      summary += "that led to " + allElements.slice(0, 3).join(', ');
      if (allElements.length > 3) summary += " and other developments";
      summary += ".";
    } else {
      summary += "leading to various developments and consequences.";
    }
    
    // Add emotional context if significant
    if (emotions.size > 0) {
      summary += " The journey involved " + Array.from(emotions).slice(0, 2).join(' and ') + ".";
    }

    console.log(`Summarizing ${olderSteps.length} older steps: ${summary}`);
    return summary;
  }

  buildMessageHistory(originalStory, timeline, currentChoice, branchPath) {
    const messages = [];
    
    // Check if the branch path is getting too long (could cause context overflow)
    if (branchPath.length > 8) {
      console.warn('Branch path is getting very long, using summarization to manage token usage');
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
      // Build the conversation history with summarization for older entries
      let baseMessage = `My original story: "${originalStory}"\nTimeline: "${timeline}"`;
      
      // Add summary of older choices if branch path is long
      const summary = this.summarizeBranchPath(branchPath, this.maxRecentSteps);
      if (summary) {
        baseMessage += `\n\n${summary}`;
      }
      
      messages.push({
        role: "user",
        parts: [{
          text: baseMessage
        }]
      });

      // Determine which steps to include in full detail
      const startIndex = branchPath.length > this.maxRecentSteps ? branchPath.length - this.maxRecentSteps : 0;
      const recentSteps = branchPath.slice(startIndex);

      // Add each step in the recent branch path
      recentSteps.forEach((step, index) => {
        const actualIndex = startIndex + index;
        
        if (actualIndex === 0) {
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

    // Log token usage information
    const totalTokens = this.calculateMessageTokens(messages);
    console.log(`Message history tokens: ${totalTokens} (Branch path length: ${branchPath.length})`);
    
    if (totalTokens > this.tokenWarningThreshold) {
      console.warn('High token usage detected, consider reducing maxRecentSteps or improving summarization');
    }

    return messages;
  }

  async generateStoryOptions(originalStory, timeline, currentStoryPart, branchPath = []) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    try {
      // Use the optimized message history that includes summarization
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