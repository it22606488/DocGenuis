// src/utils/tagUtils.js
import { createTag, getTags } from '../services/api';

// Helper function to ensure we have tag objects
export const getOrCreateTags = async (tagNames) => {
  try {
    // Get all existing tags
    const response = await getTags();
    const existingTags = response.tags || [];
    
    const tagObjects = [];
    
    // For each tag name
    for (const tagName of tagNames) {
      // Check if it already exists
      const existingTag = existingTags.find(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      if (existingTag) {
        tagObjects.push(existingTag);
      } else {
        // Create new tag if it doesn't exist
        try {
          const newTagResponse = await createTag({ name: tagName });
          if (newTagResponse.success) {
            tagObjects.push(newTagResponse.tag);
          }
        } catch (err) {
          console.error(`Error creating tag ${tagName}:`, err);
        }
      }
    }
    
    return tagObjects;
  } catch (err) {
    console.error('Error processing tags:', err);
    return [];
  }
};

// Format tags from backend to frontend format
export const formatTags = (tags) => {
  if (!tags) return [];
  
  return tags.map(tag => {
    if (typeof tag === 'string') return tag;
    return tag.name || tag;
  });
};