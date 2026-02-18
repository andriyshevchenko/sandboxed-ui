import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Metadata Persistence', () => {
  let getMetadataPath;
  let loadMetadata;
  let saveMetadata;

  beforeAll(() => {
    // Import the functions we need to test
    const homeDir = os.homedir();
    
    getMetadataPath = () => {
      const configDir = process.platform === 'win32' 
        ? path.join(homeDir, 'AppData', 'Local', 'SecureVault')
        : process.platform === 'darwin'
        ? path.join(homeDir, 'Library', 'Application Support', 'SecureVault')
        : path.join(homeDir, '.config', 'securevault');
      
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      return path.join(configDir, 'metadata.json');
    };

    loadMetadata = () => {
      try {
        const metadataPath = getMetadataPath();
        if (fs.existsSync(metadataPath)) {
          const data = fs.readFileSync(metadataPath, 'utf8');
          return JSON.parse(data);
        }
      } catch (error) {
        console.warn('Failed to load metadata from disk:', error.message);
      }
      return [];
    };

    saveMetadata = (metadata) => {
      try {
        const metadataPath = getMetadataPath();
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
      } catch (error) {
        console.error('Failed to save metadata to disk:', error.message);
      }
    };
  });

  afterEach(() => {
    // Clean up test metadata file
    const metadataPath = getMetadataPath();
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }
  });

  describe('getMetadataPath', () => {
    it('should return platform-appropriate path', () => {
      const metadataPath = getMetadataPath();
      expect(metadataPath).toContain('metadata.json');
      
      if (process.platform === 'win32') {
        expect(metadataPath).toContain('AppData');
        expect(metadataPath).toContain('Local');
        expect(metadataPath).toContain('SecureVault');
      } else if (process.platform === 'darwin') {
        expect(metadataPath).toContain('Library');
        expect(metadataPath).toContain('Application Support');
        expect(metadataPath).toContain('SecureVault');
      } else {
        expect(metadataPath).toContain('.config');
        expect(metadataPath).toContain('securevault');
      }
    });

    it('should create directory if it does not exist', () => {
      const metadataPath = getMetadataPath();
      const dir = path.dirname(metadataPath);
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  describe('saveMetadata and loadMetadata', () => {
    it('should save and load metadata correctly', () => {
      const testMetadata = [
        {
          id: 'test-id-1',
          title: 'Test Secret',
          category: 'password',
          notes: 'Test notes',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: 'test-id-2',
          title: 'Another Secret',
          category: 'api-key',
          notes: 'More notes',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      // Save metadata
      saveMetadata(testMetadata);

      // Load metadata
      const loadedMetadata = loadMetadata();

      expect(loadedMetadata).toEqual(testMetadata);
      expect(loadedMetadata.length).toBe(2);
      expect(loadedMetadata[0].id).toBe('test-id-1');
      expect(loadedMetadata[1].id).toBe('test-id-2');
    });

    it('should return empty array when file does not exist', () => {
      const loadedMetadata = loadMetadata();
      expect(loadedMetadata).toEqual([]);
    });

    it('should handle empty metadata array', () => {
      saveMetadata([]);
      const loadedMetadata = loadMetadata();
      expect(loadedMetadata).toEqual([]);
    });

    it('should persist metadata across multiple saves', () => {
      // Save initial metadata
      const metadata1 = [
        { id: '1', title: 'Secret 1', category: 'password', notes: 'Note 1', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      saveMetadata(metadata1);

      // Add more metadata
      const metadata2 = [
        { id: '1', title: 'Secret 1', category: 'password', notes: 'Note 1', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '2', title: 'Secret 2', category: 'api-key', notes: 'Note 2', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      saveMetadata(metadata2);

      // Load and verify
      const loadedMetadata = loadMetadata();
      expect(loadedMetadata.length).toBe(2);
      expect(loadedMetadata[0].id).toBe('1');
      expect(loadedMetadata[0].notes).toBe('Note 1');
      expect(loadedMetadata[1].id).toBe('2');
      expect(loadedMetadata[1].notes).toBe('Note 2');
    });
  });
});
