import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getMetadataPath, loadMetadata, saveMetadata } from '../metadataStore.js';

describe('Metadata Persistence', () => {
  let tempDir;

  beforeEach(() => {
    // Create a temporary directory for each test to avoid touching user data
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'securevault-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('getMetadataPath', () => {
    it('should return platform-appropriate path', () => {
      const metadataPath = getMetadataPath();
      expect(metadataPath).toContain('metadata.json');
      
      if (process.platform === 'win32') {
        // Should use LOCALAPPDATA env var or fallback to AppData/Local
        if (process.env.LOCALAPPDATA) {
          expect(metadataPath).toContain(process.env.LOCALAPPDATA);
        } else {
          expect(metadataPath).toContain('AppData');
          expect(metadataPath).toContain('Local');
        }
        expect(metadataPath).toContain('SecureVault');
      } else if (process.platform === 'darwin') {
        expect(metadataPath).toContain('Library');
        expect(metadataPath).toContain('Application Support');
        expect(metadataPath).toContain('SecureVault');
      } else {
        // Should use XDG_CONFIG_HOME env var or fallback to .config
        if (process.env.XDG_CONFIG_HOME) {
          expect(metadataPath).toContain(process.env.XDG_CONFIG_HOME);
        } else {
          expect(metadataPath).toContain('.config');
        }
        expect(metadataPath).toContain('securevault');
      }
    });

    it('should create directory if it does not exist', () => {
      const metadataPath = getMetadataPath(tempDir);
      const dir = path.dirname(metadataPath);
      expect(fs.existsSync(dir)).toBe(true);
    });

    it('should use override when provided', () => {
      const metadataPath = getMetadataPath(tempDir);
      expect(metadataPath).toBe(path.join(tempDir, 'metadata.json'));
    });
  });

  describe('saveMetadata and loadMetadata', () => {
    it('should save and load metadata correctly', async () => {
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
      await saveMetadata(testMetadata, tempDir);

      // Load metadata
      const loadedMetadata = loadMetadata(tempDir);

      expect(loadedMetadata).toEqual(testMetadata);
      expect(loadedMetadata.length).toBe(2);
      expect(loadedMetadata[0].id).toBe('test-id-1');
      expect(loadedMetadata[1].id).toBe('test-id-2');
    });

    it('should return empty array when file does not exist', () => {
      const loadedMetadata = loadMetadata(tempDir);
      expect(loadedMetadata).toEqual([]);
    });

    it('should handle empty metadata array', async () => {
      await saveMetadata([], tempDir);
      const loadedMetadata = loadMetadata(tempDir);
      expect(loadedMetadata).toEqual([]);
    });

    it('should persist metadata across multiple saves', async () => {
      // Save initial metadata
      const metadata1 = [
        { id: '1', title: 'Secret 1', category: 'password', notes: 'Note 1', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      await saveMetadata(metadata1, tempDir);

      // Add more metadata
      const metadata2 = [
        { id: '1', title: 'Secret 1', category: 'password', notes: 'Note 1', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '2', title: 'Secret 2', category: 'api-key', notes: 'Note 2', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      await saveMetadata(metadata2, tempDir);

      // Load and verify
      const loadedMetadata = loadMetadata(tempDir);
      expect(loadedMetadata.length).toBe(2);
      expect(loadedMetadata[0].id).toBe('1');
      expect(loadedMetadata[0].notes).toBe('Note 1');
      expect(loadedMetadata[1].id).toBe('2');
      expect(loadedMetadata[1].notes).toBe('Note 2');
    });

    it('should validate loaded metadata is an array', async () => {
      // Write invalid JSON (not an array)
      const metadataPath = getMetadataPath(tempDir);
      fs.writeFileSync(metadataPath, JSON.stringify({ invalid: 'object' }), 'utf8');

      // Should return empty array and not crash
      const loadedMetadata = loadMetadata(tempDir);
      expect(loadedMetadata).toEqual([]);
    });

    it('should handle corrupted JSON gracefully', () => {
      // Write invalid JSON
      const metadataPath = getMetadataPath(tempDir);
      fs.writeFileSync(metadataPath, '{ invalid json', 'utf8');

      // Should return empty array and not crash
      const loadedMetadata = loadMetadata(tempDir);
      expect(loadedMetadata).toEqual([]);
    });

    it('should set restrictive file permissions', async () => {
      const testMetadata = [
        { id: 'test', title: 'Test', category: 'password', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      
      await saveMetadata(testMetadata, tempDir);
      
      const metadataPath = getMetadataPath(tempDir);
      const stats = fs.statSync(metadataPath);
      
      // On POSIX systems, check that file is user-only (0o600)
      if (process.platform !== 'win32') {
        const mode = stats.mode & 0o777;
        expect(mode).toBe(0o600);
      }
    });
  });
});
