import { useState } from 'react'
import './InitialStoryForm.css'

const InitialStoryForm = ({ onSubmit, isLoading }) => {
  const [story, setStory] = useState('')
  const [timeline, setTimeline] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (story.trim() && timeline.trim() && !isLoading) {
      onSubmit(story.trim(), timeline.trim())
    }
  }

  return (
    <div className="initial-story-form">
      <div className="form-container">
        <h2>Begin Your "What If" Journey</h2>
        <p>Tell us your story and set the timeline for alternate possibilities</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="story">Your Story</label>
            <textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe your story in detail. The more descriptive, the better the AI can create alternate scenarios. What happened? Who was involved? What were the circumstances?"
              rows="8"
              required
            />
            <small>Be as detailed as possible - include characters, setting, emotions, and key events</small>
          </div>

          <div className="form-group">
            <label htmlFor="timeline">Timeline for Next Events</label>
            <input
              type="text"
              id="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g., 'the next day', 'within a week', 'immediately after', 'a year later'"
              required
            />
            <small>Specify when the alternate events should occur</small>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!story.trim() || !timeline.trim() || isLoading}
          >
            {isLoading ? 'Creating Story...' : 'Create My Story'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default InitialStoryForm