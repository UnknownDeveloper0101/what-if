import { useState } from 'react'
import './StoryTree.css'
import StoryNode from './StoryNode'

const StoryTree = ({ node, onUpdate, generateAIResponse, generateOptions }) => {
  // Simple linear story display - no expand/collapse needed

  const addChildNode = async (parentId, choiceText, isCustom = false) => {
    const newChildId = Date.now().toString()
    
    // First, add the node with loading state
    const addChildWithLoading = (currentNode) => {
      if (currentNode.id === parentId) {
        // Build the new branch path by extending the parent's path
        const newBranchPath = [
          ...(currentNode.branchPath || []),
          { choice: choiceText, aiResponse: currentNode.aiResponse }
        ]
        
        const newChild = {
          id: newChildId,
          content: currentNode.content, // Keep original story content
          timeline: currentNode.timeline, // Keep original timeline
          aiResponse: "🤖 Generating your story...",
          options: [],
          children: [],
          level: currentNode.level + 1,
          isCustom: isCustom,
          isLoading: true,
          branchPath: newBranchPath
        }
        
        return {
          ...currentNode,
          children: [...currentNode.children, newChild]
        }
      }
      
      return {
        ...currentNode,
        children: currentNode.children.map(child => addChildWithLoading(child))
      }
    }
    
    const treeWithLoading = addChildWithLoading(node)
    onUpdate(treeWithLoading)
    
    // Then generate the actual content
    try {
      const parentNode = findNodeById(node, parentId)
      const aiResponse = await generateAIResponse(choiceText, parentNode)
      
      // Build the updated branch path for generating options
      const updatedBranchPath = [
        ...(parentNode.branchPath || []),
        { choice: choiceText, aiResponse: aiResponse }
      ]
      
      const options = await generateOptions(parentNode.content, parentNode.timeline, aiResponse, updatedBranchPath)
      
      const updateChildContent = (currentNode) => {
        if (currentNode.id === newChildId) {
          return {
            ...currentNode,
            aiResponse: aiResponse,
            options: options,
            isLoading: false,
            branchPath: updatedBranchPath
          }
        }
        
        return {
          ...currentNode,
          children: currentNode.children.map(child => updateChildContent(child))
        }
      }
      
      const finalTree = updateChildContent(treeWithLoading)
      onUpdate(finalTree)
    } catch (error) {
      console.error('Error generating story content:', error)
      
      const updateChildWithError = (currentNode) => {
        if (currentNode.id === newChildId) {
          return {
            ...currentNode,
            aiResponse: `Sorry, there was an error generating the story: ${error.message}`,
            options: [],
            isLoading: false,
            hasError: true
          }
        }
        
        return {
          ...currentNode,
          children: currentNode.children.map(child => updateChildWithError(child))
        }
      }
      
      const errorTree = updateChildWithError(treeWithLoading)
      onUpdate(errorTree)
    }
  }
  
  const findNodeById = (node, id) => {
    if (node.id === id) return node
    
    for (let child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
    
    return null
  }

  const endStory = (nodeId) => {
    const markAsEnded = (currentNode) => {
      if (currentNode.id === nodeId) {
        return {
          ...currentNode,
          isEnded: true,
          aiResponse: currentNode.aiResponse + "\n\n🎭 THE END 🎭\n\nThis branch of your story has reached its conclusion. You can explore other paths or start a new story altogether."
        }
      }
      
      return {
        ...currentNode,
        children: currentNode.children.map(child => markAsEnded(child))
      }
    }
    
    const updatedTree = markAsEnded(node)
    onUpdate(updatedTree)
  }

  // Flatten the tree into a linear array for simple display
  const flattenTree = (node, result = []) => {
    result.push(node)
    // Always show all nodes in linear fashion
    node.children.forEach(child => flattenTree(child, result))
    return result
  }

  const flatNodes = flattenTree(node)

  return (
    <div className="story-tree">
      <div className="story-container">
        {flatNodes.map((storyNode, index) => (
          <div key={storyNode.id} className="story-node-wrapper">
            <StoryNode
              node={storyNode}
              onAddChild={addChildNode}
              onEndStory={endStory}
              level={storyNode.level}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default StoryTree