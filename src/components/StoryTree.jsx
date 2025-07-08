import { useState } from 'react'
import './StoryTree.css'
import StoryNode from './StoryNode'

const StoryTree = ({ node, onUpdate, generateAIResponse, generateOptions }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set([node.id]))

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const addChildNode = async (parentId, choiceText, isCustom = false) => {
    const newChildId = Date.now().toString()
    
    // First, add the node with loading state
    const addChildWithLoading = (currentNode) => {
      if (currentNode.id === parentId) {
        const newChild = {
          id: newChildId,
          content: choiceText,
          timeline: "continuing the story...",
          aiResponse: "🤖 Generating your story...",
          options: [],
          children: [],
          level: currentNode.level + 1,
          isCustom: isCustom,
          isLoading: true,
          storyHistory: [
            ...(currentNode.storyHistory || []),
            { choice: choiceText, result: currentNode.aiResponse }
          ]
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
    setExpandedNodes(prev => new Set([...prev, newChildId]))
    
    // Then generate the actual content
    try {
      const parentNode = findNodeById(node, parentId)
      const aiResponse = await generateAIResponse(choiceText, parentNode)
      const options = await generateOptions(parentNode.content, aiResponse)
      
      const updateChildContent = (currentNode) => {
        if (currentNode.id === newChildId) {
          return {
            ...currentNode,
            aiResponse: aiResponse,
            options: options,
            isLoading: false
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

  return (
    <div className="story-tree">
      <div className="tree-container">
        <StoryNode
          node={node}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={() => toggleNode(node.id)}
          onAddChild={addChildNode}
          onEndStory={endStory}
          level={0}
        />
        {renderChildren(node, expandedNodes, toggleNode, addChildNode, endStory)}
      </div>
    </div>
  )
}

const renderChildren = (node, expandedNodes, toggleNode, addChildNode, endStory, parentPos = { x: 0, y: 0 }) => {
  if (!expandedNodes.has(node.id) || node.children.length === 0) {
    return null
  }

  return node.children.map((child, index) => (
    <div key={child.id} className="child-container">
      <div className="branch-line" style={{ left: `${parentPos.x + 50}px` }}></div>
      <StoryNode
        node={child}
        isExpanded={expandedNodes.has(child.id)}
        onToggle={() => toggleNode(child.id)}
        onAddChild={addChildNode}
        onEndStory={endStory}
        level={child.level}
      />
      {renderChildren(child, expandedNodes, toggleNode, addChildNode, endStory, { x: parentPos.x + 100, y: parentPos.y + 100 })}
    </div>
  ))
}

export default StoryTree