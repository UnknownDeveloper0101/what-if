import { useState } from 'react';
import './ApiKeySetup.css';
import geminiService from '../services/geminiService';

const ApiKeySetup = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Test the API key by making a simple request
      geminiService.setApiKey(apiKey.trim());
      await geminiService.generateStoryResponse(
        'Test story', 
        'Test timeline', 
        null, 
        []
      );
      
      onApiKeySet();
    } catch (error) {
      setError(`API key validation failed: ${error.message}`);
      geminiService.setApiKey(''); // Clear invalid key
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-key-setup">
      <div className="setup-container">
        <h2>🤖 Setup Gemini AI</h2>
        <p>To generate amazing stories, you'll need a Google Gemini API key.</p>
        
        <div className="info-section">
          <h3>How to get your API key:</h3>
          <ol>
            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy the generated API key</li>
            <li>Paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <div className="api-key-input-container">
              <input
                type={showKey ? 'text' : 'password'}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className={error ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                disabled={isLoading}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="setup-btn"
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? 'Validating...' : 'Start Creating Stories'}
          </button>
        </form>

        <div className="security-note">
          <p><strong>🔒 Security Note:</strong> Your API key is stored locally in your browser and never sent to any third-party servers except Google's Gemini API.</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;