import { TLAssetStore, TLAsset, Editor } from 'tldraw';
import { uploadImageToSupabase, uploadDataUrlsToSupabase } from '@/lib/storage/image-upload';

/**
 * Custom asset store for Tldraw that uploads images to Supabase Storage
 */
export const supabaseAssetStore: TLAssetStore = {
  /**
   * Upload a file to Supabase and return the URL
   */
  async upload(asset: TLAsset, file: File): Promise<{ src: string }> {
    console.log('Tldraw asset upload starting:', { fileName: file.name, fileSize: file.size });
    const result = await uploadImageToSupabase(file, 'diary-images');
    
    if (!result.success || !result.url) {
      console.error('Tldraw asset upload failed:', result.error);
      throw new Error(result.error || 'Upload failed');
    }
    
    console.log('Tldraw asset upload successful:', result.url);
    return { src: result.url };
  },

  /**
   * Resolve an asset to its URL
   */
  resolve(asset: TLAsset): string | null {
    // If it's already a URL, return it
    if (asset.props.src && asset.props.src.startsWith('http')) {
      return asset.props.src;
    }
    
    // If it's a data URL, return it (will be uploaded later)
    if (asset.props.src && asset.props.src.startsWith('data:')) {
      return asset.props.src;
    }
    
    // If it's an asset: reference, we need to handle it
    if (asset.props.src && asset.props.src.startsWith('asset:')) {
      // For now, return null to indicate it needs to be uploaded
      return null;
    }
    
    return asset.props.src || null;
  }
};

/**
 * Clean up localStorage to prevent quota issues
 */
export function cleanupLocalStorage() {
  try {
    // Get all tldraw-related keys
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('tldraw-quote-') || key.startsWith('tldraw-snapshot-')
    );
    
    // If we have more than 5 saved designs, remove the oldest ones
    if (keys.length > 5) {
      const keyTimestamps = keys.map(key => {
        try {
          const data = localStorage.getItem(key);
          const parsed = data ? JSON.parse(data) : null;
          return {
            key,
            timestamp: parsed?.timestamp || 0
          };
        } catch {
          return { key, timestamp: 0 };
        }
      });
      
      // Sort by timestamp and remove oldest entries
      keyTimestamps.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = keyTimestamps.slice(0, keys.length - 3); // Keep only 3 most recent
      
      toRemove.forEach(({ key }) => {
        localStorage.removeItem(key);
        console.log(`Cleaned up old tldraw data: ${key}`);
      });
    }
  } catch (error) {
    console.warn('Failed to cleanup localStorage:', error);
  }
}

/**
 * Upload all local assets in the editor to Supabase and save design to entries
 */
export async function uploadAllAssetsToSupabase(editor: Editor, entryId?: string): Promise<{
  success: boolean;
  uploadedCount: number;
  errors: string[];
  savedEntryId?: string;
}> {
  const store = editor.store;
  const assets = store.allRecords().filter((record) => 
    record.typeName === 'asset'
  ) as TLAsset[];
  
  let uploadedCount = 0;
  const errors: string[] = [];
  const assetUpdateMap = new Map<string, string>(); // asset ID -> new URL
  
  console.log(`Found ${assets.length} assets to process`);
  
  // Process each asset
  for (const asset of assets) {
    const src = asset.props.src;
    
    // Skip if already uploaded to Supabase
    if (src && src.includes('supabase')) {
      console.log(`Asset ${asset.id} already in Supabase, skipping`);
      continue;
    }
    
    // Handle asset:xxx references (IndexedDB blobs)
    if (src && src.startsWith('asset:')) {
      try {
        console.log(`Processing IndexedDB asset: ${asset.id}`);
        
        // Try to get asset data from IndexedDB
        const fileName = (asset.props as { name?: string }).name || `asset-${asset.id}`;
        const assetData = await getAssetBlobFromIndexedDB(asset.id, fileName);
        
        if (assetData) {
          // Upload blob to Supabase
          const result = await uploadBlobToSupabase(assetData, fileName);
          if (result.success && result.url) {
            assetUpdateMap.set(asset.id, result.url);
            uploadedCount++;
            console.log(`Successfully uploaded asset ${asset.id} to ${result.url}`);
          } else {
            errors.push(`Failed to upload asset ${asset.id}: ${result.error}`);
          }
        } else {
          errors.push(`Cannot retrieve blob data for asset ${asset.id} from IndexedDB`);
        }
      } catch (error) {
        errors.push(`Error processing asset ${asset.id}: ${error}`);
      }
    }
    
    // Handle data URLs (already base64)
    else if (src && src.startsWith('data:')) {
      try {
        console.log(`Processing data URL asset: ${asset.id}`);
        const results = await uploadDataUrlsToSupabase([src]);
        const result = results[0];
        
        if (result.success && result.url) {
          assetUpdateMap.set(asset.id, result.url);
          uploadedCount++;
          console.log(`Successfully uploaded data URL asset ${asset.id} to ${result.url}`);
        } else {
          errors.push(`Failed to upload asset ${asset.id}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Error uploading asset ${asset.id}: ${error}`);
      }
    }
  }
  
  // Update the editor with new asset URLs
  console.log(`Updating ${assetUpdateMap.size} assets with cloud URLs`);
  for (const [assetId, newUrl] of assetUpdateMap) {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      store.put([{
        ...asset,
        props: {
          ...asset.props,
          src: newUrl
        }
      }] as TLAsset[]);
    }
  }
  
  // Get the updated snapshot with cloud URLs
  const updatedSnapshot = editor.store.getSnapshot();
  
  // Save the complete design to entries table
  let savedEntryId: string | undefined;
  try {
    savedEntryId = await saveDesignToEntries(updatedSnapshot, entryId);
    console.log(`Design saved to entries with ID: ${savedEntryId}`);
  } catch (error) {
    errors.push(`Failed to save design to entries: ${error}`);
  }
  
  // Clean up localStorage to prevent quota issues
  cleanupLocalStorage();
  
  return {
    success: errors.length === 0,
    uploadedCount,
    errors,
    savedEntryId
  };
}

/**
 * Convert a File to a data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract all image URLs from a Tldraw snapshot
 */
export function extractImageUrls(snapshot: Record<string, unknown>): string[] {
  const urls: string[] = [];
  
  if (!snapshot || !snapshot.store) return urls;
  
  for (const [, record] of Object.entries(snapshot.store as Record<string, unknown>)) {
    const typedRecord = record as { typeName?: string; props?: { src?: string } };
    if (typedRecord.typeName === 'asset' && typedRecord.props?.src) {
      urls.push(typedRecord.props.src);
    }
  }
  
  return urls;
}

/**
 * Get asset blob data from IndexedDB
 */
async function getAssetBlobFromIndexedDB(assetId: string, fileName: string): Promise<File | null> {
  try {
    // Try to access IndexedDB for tldraw assets
    return new Promise((resolve) => {
      const request = indexedDB.open('tldraw', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Try common table names for assets
        const possibleStores = ['assets', 'blobs', 'files'];
        let found = false;
        
        for (const storeName of possibleStores) {
          try {
            if (db.objectStoreNames.contains(storeName)) {
              const transaction = db.transaction([storeName], 'readonly');
              const store = transaction.objectStore(storeName);
              const getRequest = store.get(assetId);
              
              getRequest.onsuccess = () => {
                if (getRequest.result && !found) {
                  found = true;
                  const result = getRequest.result;
                  // Convert blob to File
                  if (result instanceof Blob) {
                    const file = new File([result], fileName, { type: result.type });
                    resolve(file);
                  } else if (result.blob && result.blob instanceof Blob) {
                    const file = new File([result.blob], fileName, { type: result.blob.type });
                    resolve(file);
                  } else {
                    resolve(null);
                  }
                }
              };
              
              getRequest.onerror = () => {
                if (!found) resolve(null);
              };
            }
          } catch (error) {
            console.warn(`Failed to access store ${storeName}:`, error);
          }
        }
        
        // If no stores found, resolve null
        setTimeout(() => {
          if (!found) resolve(null);
        }, 1000);
      };
      
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return null;
  }
}

/**
 * Upload blob to Supabase storage
 */
async function uploadBlobToSupabase(file: File, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', `diary-images/${Date.now()}-${Math.random().toString(36).substring(2)}-${fileName}`);
  formData.append('bucket', 'diary-images');
  
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    return {
      success: false,
      error: errorData.error || 'Upload failed'
    };
  }
  
  const data = await response.json();
  return {
    success: true,
    url: data.url
  };
}

/**
 * Save design snapshot to entries table
 */
async function saveDesignToEntries(snapshot: unknown, entryId?: string): Promise<string> {
  const designData = {
    type: 'tldraw-design',
    snapshot,
    timestamp: Date.now(),
    entryId: entryId || `design-${Date.now()}`,
  };
  
  const response = await fetch('/api/yellowbox/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entries: {
        selectedQuestion: 'Design Canvas',
        conversationHistory: [
          {
            type: 'user',
            content: 'Created a design canvas with images and text',
            images: []
          }
        ],
        timeOfDay: 'daytime' as const,
        conversationCount: 1,
        completedAt: new Date().toISOString(),
      },
      session_id: `design-${Date.now()}`,
      metadata: {
        currentFont: 'sans',
        language: 'en',
        totalMessages: 1,
        aiSummary: 'Design Canvas',
        designData, // Store the complete design data here
      },
      analytics: {}
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save design: ${response.status}`);
  }
  
  const result = await response.json();
  return result.entryId || designData.entryId;
}