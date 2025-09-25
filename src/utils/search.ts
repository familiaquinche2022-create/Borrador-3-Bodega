// Utility function for wildcard search
export function wildcardSearch(text: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    // If no wildcards, do normal case-insensitive search
    return text.toLowerCase().includes(pattern.toLowerCase());
  }

  // Convert wildcard pattern to regex
  // Escape special regex characters except *
  const escapedPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '.*'); // Replace * with .*
  
  const regex = new RegExp(escapedPattern, 'i'); // Case insensitive
  return regex.test(text);
}

// Search function that handles multiple fields with wildcards
export function searchInventoryItem(item: any, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;
  
  const searchFields = [
    item.nombre,
    item.codigo,
    item.ubicacion,
    item.tipo
  ];
  
  return searchFields.some(field => 
    field && wildcardSearch(String(field), searchTerm)
  );
}