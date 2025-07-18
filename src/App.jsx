import { useState, useEffect } from 'react'
import './App.css'
import StoryTree from './components/StoryTree'
import InitialStoryForm from './components/InitialStoryForm'
import ApiKeySetup from './components/ApiKeySetup'
import ErrorBoundary from './components/ErrorBoundary'
import geminiService from './services/geminiService'

function App() {
  const [storyTree, setStoryTree] = useState(null)
  const [isStarted, setIsStarted] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setHasApiKey(geminiService.hasApiKey())
  }, [])

  const handleInitialStory = async (initialStory, timeline) => {
    setIsLoading(true)
    setError('')

    try {
      // Generate AI response
      const aiResponse = await geminiService.generateStoryResponse(
        initialStory, 
        timeline, 
        null, 
        []
      )

      // Generate options
      const options = await geminiService.generateStoryOptions(
        initialStory, 
        timeline,
        aiResponse,
        []
      )

      const newStoryTree = {
        id: '1',
        content: initialStory,
        timeline: timeline,
        aiResponse: aiResponse,
        options: options,
        children: [],
        level: 0,
        branchPath: [{ aiResponse: aiResponse }]
      }
      
      setStoryTree(newStoryTree)
      setIsStarted(true)
    } catch (error) {
      setError(`Failed to generate story: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (choice, parentNode) => {
    try {
      const branchPath = parentNode.branchPath || []
      const response = await geminiService.generateStoryResponse(
        parentNode.content,
        parentNode.timeline,
        choice,
        branchPath
      )
      
      // Check if response is valid and substantial
      if (!response || response.length < 200) {
        throw new Error('Response too short or empty')
      }
      
      // Check if response contains generic fallback indicators
      if (response.includes('The path ahead is uncertain') || 
          response.includes('The story continues as you chose')) {
        throw new Error('Received generic fallback response')
      }
      
      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      
      // Create a more contextual fallback response
      return `I chose to ${choice.toLowerCase()}. The weight of this decision settles over me as I consider the implications. This moment represents a turning point, and whatever happens next will be shaped by the courage or caution I've shown.

The story continues to unfold, carrying with it the hopes and fears that have brought me to this crossroads. Each choice builds upon the last, creating a path that is uniquely mine. Sometimes the most important moments come not from grand gestures, but from the quiet decisions we make when no one else is watching.

As I move forward, I carry with me the lessons learned and the emotions felt. The future remains unwritten, a blank page waiting for the next chapter to begin.`
    }
  }

  const generateOptions = async (originalStory, timeline, currentStoryPart, branchPath = []) => {
    try {
      const options = await geminiService.generateStoryOptions(originalStory, timeline, currentStoryPart, branchPath)
      return options
    } catch (error) {
      console.error('Error generating options:', error)
      return geminiService.getDefaultOptions()
    }
  }

  const handleReset = () => {
    setStoryTree(null)
    setIsStarted(false)
    setError('')
  }

  const handleApiKeySet = () => {
    setHasApiKey(true)
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>What If? - Interactive Story Creator</h1>
          <p>Create alternate realities and explore infinite possibilities</p>
        </header>
        
        <main className="app-main">
        {!hasApiKey ? (
          <ApiKeySetup onApiKeySet={handleApiKeySet} />
        ) : !isStarted ? (
          <div>
            <InitialStoryForm onSubmit={handleInitialStory} isLoading={isLoading} />
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => setError('')} className="dismiss-error">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="story-container">
            <div className="story-header">
              <button className="reset-btn" onClick={handleReset}>
                Start New Story
              </button>
              <button 
                className="api-key-btn" 
                onClick={() => {
                  geminiService.setApiKey('')
                  setHasApiKey(false)
                  setIsStarted(false)
                  setStoryTree(null)
                }}
              >
                Change API Key
              </button>
            </div>
            <StoryTree 
              node={storyTree} 
              onUpdate={setStoryTree}
              generateAIResponse={generateAIResponse}
              generateOptions={generateOptions}
            />
          </div>
        )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
