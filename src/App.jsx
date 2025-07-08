import { useState, useEffect } from 'react'
import './App.css'
import StoryTree from './components/StoryTree'
import InitialStoryForm from './components/InitialStoryForm'
import ApiKeySetup from './components/ApiKeySetup'
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
        aiResponse
      )

      const newStoryTree = {
        id: '1',
        content: initialStory,
        timeline: timeline,
        aiResponse: aiResponse,
        options: options,
        children: [],
        level: 0,
        storyHistory: []
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
      const storyHistory = parentNode.storyHistory || []
      const response = await geminiService.generateStoryResponse(
        parentNode.content,
        parentNode.timeline,
        choice,
        storyHistory
      )
      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      return `The story continues as you chose: "${choice}"\n\nThe path ahead is uncertain, but your decision has set events in motion that will shape the outcome of your journey. What happens next depends on the choices you make...`
    }
  }

  const generateOptions = async (storyContext, currentStoryPart) => {
    try {
      const options = await geminiService.generateStoryOptions(storyContext, currentStoryPart)
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
  )
}

export default App
