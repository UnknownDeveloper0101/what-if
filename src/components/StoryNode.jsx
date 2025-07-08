import { useState } from 'react'
import './StoryNode.css'

const StoryNode = ({ node, isExpanded, onToggle, onAddChild, onEndStory, level }) => {
  const [customOption, setCustomOption] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (customOption.trim()) {
      await onAddChild(node.id, customOption.trim(), true)
      setCustomOption('')
      setShowCustomInput(false)
    }
  }

  const handleOptionClick = async (option) => {
    await onAddChild(node.id, option)
  }

  const handleEndStory = () => {
    onEndStory(node.id)
  }

  return (
    <div className={`story-node level-${level}`}>
      <div className="node-header">
        <button 
          className="expand-btn" 
          onClick={onToggle}
          disabled={node.isEnded}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <h3 className="node-title">
          {level === 0 ? 'Original Story' : `Choice: ${node.content.substring(0, 50)}...`}
          {node.isCustom && <span className="custom-badge">Custom</span>}
        </h3>
      </div>

      {isExpanded && (
        <div className="node-content">
          {level === 0 && (
            <div className="original-story">
              <h4>Your Story:</h4>
              <p className="story-text">{node.content}</p>
              <p className="timeline"><strong>Timeline:</strong> {node.timeline}</p>
            </div>
          )}

          <div className={`ai-response ${node.isLoading ? 'loading' : ''} ${node.hasError ? 'error' : ''}`}>
            <h4>AI Response:</h4>
            <div className="response-text">
              {node.isLoading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Generating story...</p>
                </div>
              )}
              {!node.isLoading && node.aiResponse.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {!node.isEnded && !node.isLoading && !node.hasError && (
            <div className="options-section">
              <h4>What happens next?</h4>
              <div className="options-grid">
                {node.options.map((option, index) => (
                  <button
                    key={index}
                    className="option-btn"
                    onClick={() => handleOptionClick(option)}
                  >
                    <span className="option-number">{index + 1}</span>
                    {option}
                  </button>
                ))}
                
                <button
                  className="option-btn end-story-btn"
                  onClick={handleEndStory}
                >
                  <span className="option-number">5</span>
                  End this story branch
                </button>
              </div>

              <div className="custom-option">
                {!showCustomInput ? (
                  <button
                    className="custom-toggle-btn"
                    onClick={() => setShowCustomInput(true)}
                  >
                    ✏️ Create Your Own Option
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="custom-form">
                    <textarea
                      value={customOption}
                      onChange={(e) => setCustomOption(e.target.value)}
                      placeholder="Describe your own path for the story..."
                      rows="3"
                      className="custom-input"
                    />
                    <div className="custom-actions">
                      <button type="submit" className="submit-custom-btn">
                        Add Custom Option
                      </button>
                      <button
                        type="button"
                        className="cancel-custom-btn"
                        onClick={() => {
                          setShowCustomInput(false)
                          setCustomOption('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StoryNode