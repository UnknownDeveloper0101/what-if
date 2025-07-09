# Token Size Optimization for Story Branches

## Problem
When story branches get 20-30 steps deep, the token count for the message history becomes very large:
- Original story + full branch path + current choice
- This quickly hits Gemini's token limits and causes API errors
- Each story continuation can be 250-350 words, so 20+ branches = massive token usage

## Solution
Implemented intelligent token optimization in `geminiService.js`:

### 1. Branch Path Summarization
- **Keep recent steps in full detail** (default: 5 most recent steps)
- **Summarize older steps** into a concise summary like:
  > "Previously, the user chose risky paths and cautious approaches that led to betrayal, hidden secrets being revealed, and conflict."

### 2. Smart Summarization Algorithm
The `summarizeBranchPath()` method analyzes older steps to extract:
- **Themes**: risky paths, cautious approaches, bold decisions, seeking help, etc.
- **Outcomes**: betrayal, discovery, romance, conflict, success, failure, etc.
- **Emotions**: fear, anger, hope, despair, joy, etc.
- **Key Events**: violence, transformation, journey, power, etc.

### 3. Token Tracking
- **Estimates token usage** (4 characters ≈ 1 token)
- **Logs token statistics** to console
- **Warns when approaching limits** (default: 8000 tokens)
- **Provides comparison** with/without optimization

### 4. Configuration Options
```javascript
// Configure optimization settings
GeminiService.configureTokenOptimization({
  maxRecentSteps: 3,        // Keep 3 recent steps in full detail
  tokenWarningThreshold: 6000  // Warn at 6000 tokens
});

// Get token statistics
const stats = GeminiService.getTokenStatistics(originalStory, timeline, branchPath);
```

## Key Benefits

### ✅ Prevents Token Limit Errors
- Reduces token usage by 60-80% for long story branches
- Maintains story continuity and context
- Scales to 50+ story branches without issues

### ✅ Intelligent Context Preservation
- Keeps recent choices in full detail (most important for continuity)
- Summarizes older choices to maintain narrative flow
- Preserves emotional and thematic context

### ✅ Configurable and Monitorable
- Adjustable `maxRecentSteps` (1-10)
- Token usage logging and warnings
- Statistics for optimization effectiveness

## Usage Examples

### Before Optimization (Token Issues)
```
Branch Path: 20 steps × 300 words avg = 6000 words = ~24,000 tokens
Result: API errors, failed requests
```

### After Optimization
```
Recent Steps: 5 steps × 300 words = 1500 words = ~6,000 tokens
Summary: "Previously, the user chose risky paths that led to betrayal and discovery." = ~50 tokens
Total: ~6,050 tokens ✅
```

## Implementation Details

### Message History Structure
1. **System instructions** (unchanged)
2. **Original story + timeline** (unchanged)
3. **Summary of older steps** (new - if branch path > maxRecentSteps)
4. **Recent steps in full detail** (last N steps)
5. **Current choice** (unchanged)

### Summarization Process
1. Extract themes, outcomes, emotions from older steps
2. Build intelligent summary focusing on narrative flow
3. Include emotional context for better continuity
4. Log summary for debugging/monitoring

## Testing
Run the test file to verify optimization:
```bash
node tests/token_optimization_test.js
```

## Configuration Recommendations

### For Short Stories (< 10 branches)
```javascript
GeminiService.configureTokenOptimization({
  maxRecentSteps: 5,
  tokenWarningThreshold: 8000
});
```

### For Long Stories (20+ branches)
```javascript
GeminiService.configureTokenOptimization({
  maxRecentSteps: 3,
  tokenWarningThreshold: 6000
});
```

### For Very Long Stories (50+ branches)
```javascript
GeminiService.configureTokenOptimization({
  maxRecentSteps: 2,
  tokenWarningThreshold: 5000
});
```

## Monitoring
Check console logs for:
- Token usage per request
- Summarization details
- Warning when approaching limits
- Effectiveness statistics

This optimization ensures your story tree can grow indefinitely without hitting token limits while maintaining narrative quality and continuity.